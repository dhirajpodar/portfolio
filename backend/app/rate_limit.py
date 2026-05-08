"""In-memory rate limiter for chat endpoint.

Uses sliding-window counters to cap LLM spend:
- Per-IP per-minute (burst protection)
- Per-IP per-day (single-user budget)
- Global per-day (total LLM budget safety net)

Single-process only. If scaling horizontally, move to Redis.
"""

import asyncio
import time
from collections import defaultdict, deque


class RateLimiter:
    def __init__(
        self,
        per_ip_per_min: int,
        per_ip_per_day: int,
        global_per_day: int,
    ):
        self.per_ip_per_min = per_ip_per_min
        self.per_ip_per_day = per_ip_per_day
        self.global_per_day = global_per_day
        self._ip_hits: dict[str, deque[float]] = defaultdict(deque)
        self._global_hits: deque[float] = deque()
        self._lock = asyncio.Lock()

    async def check(self, ip: str) -> tuple[bool, str | None]:
        """Returns (allowed, reason_if_denied). Records the hit if allowed."""
        now = time.time()
        day_ago = now - 86400
        min_ago = now - 60

        async with self._lock:
            while self._global_hits and self._global_hits[0] < day_ago:
                self._global_hits.popleft()
            if len(self._global_hits) >= self.global_per_day:
                return False, (
                    "I've hit my daily chat budget for today — this portfolio "
                    "runs on a limited LLM quota. Please try again tomorrow, "
                    "or reach out directly via email."
                )

            hits = self._ip_hits[ip]
            while hits and hits[0] < day_ago:
                hits.popleft()

            day_count = len(hits)
            min_count = sum(1 for t in hits if t >= min_ago)

            if min_count >= self.per_ip_per_min:
                return False, (
                    "You're sending messages a bit fast — please wait a minute "
                    "before trying again."
                )
            if day_count >= self.per_ip_per_day:
                return False, (
                    "You've reached your daily message limit for this chat. "
                    "Please try again tomorrow, or reach out directly via email."
                )

            hits.append(now)
            self._global_hits.append(now)

            if len(self._ip_hits) > 1000:
                for k in [k for k, v in self._ip_hits.items() if not v]:
                    del self._ip_hits[k]

            return True, None
