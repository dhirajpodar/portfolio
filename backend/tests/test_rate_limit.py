"""Unit tests for RateLimiter.

Run from backend/:  python -m unittest tests.test_rate_limit
"""

import asyncio
import os
import sys
import unittest
from unittest.mock import patch

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.rate_limit import RateLimiter


class RateLimiterTests(unittest.IsolatedAsyncioTestCase):
    async def test_burst_blocked_by_per_minute_cap(self):
        rl = RateLimiter(per_ip_per_min=3, per_ip_per_day=100, global_per_day=100)

        for _ in range(3):
            allowed, reason = await rl.check("1.1.1.1")
            self.assertTrue(allowed)
            self.assertIsNone(reason)

        allowed, reason = await rl.check("1.1.1.1")
        self.assertFalse(allowed)
        self.assertIn("fast", reason)

    async def test_per_ip_daily_cap_trips_when_spread_across_minutes(self):
        """Advance time between calls so the per-minute cap never triggers."""
        rl = RateLimiter(per_ip_per_min=100, per_ip_per_day=3, global_per_day=100)

        fake_time = [1_000_000.0]
        with patch("app.rate_limit.time.time", lambda: fake_time[0]):
            for _ in range(3):
                allowed, _ = await rl.check("2.2.2.2")
                self.assertTrue(allowed)
                fake_time[0] += 120  # +2 minutes between calls

            allowed, reason = await rl.check("2.2.2.2")
            self.assertFalse(allowed)
            self.assertIn("daily message limit", reason)

    async def test_global_daily_cap_trips_across_different_ips(self):
        rl = RateLimiter(per_ip_per_min=100, per_ip_per_day=100, global_per_day=3)

        for i in range(3):
            allowed, _ = await rl.check(f"10.0.0.{i}")
            self.assertTrue(allowed)

        allowed, reason = await rl.check("10.0.0.99")
        self.assertFalse(allowed)
        self.assertIn("daily chat budget", reason)

    async def test_global_cap_takes_precedence_over_per_ip(self):
        """If global is exhausted, per-IP headroom doesn't save the request."""
        rl = RateLimiter(per_ip_per_min=100, per_ip_per_day=100, global_per_day=2)

        await rl.check("3.3.3.3")
        await rl.check("4.4.4.4")

        # Fresh IP, but global is spent
        allowed, reason = await rl.check("5.5.5.5")
        self.assertFalse(allowed)
        self.assertIn("daily chat budget", reason)

    async def test_sliding_window_recovers_after_day_rolls(self):
        """After 24h+, old entries are evicted and the IP can use quota again."""
        rl = RateLimiter(per_ip_per_min=100, per_ip_per_day=2, global_per_day=100)

        fake_time = [1_000_000.0]
        with patch("app.rate_limit.time.time", lambda: fake_time[0]):
            await rl.check("6.6.6.6")
            await rl.check("6.6.6.6")
            allowed, _ = await rl.check("6.6.6.6")
            self.assertFalse(allowed)

            # Jump 25 hours — old entries fall out of the window
            fake_time[0] += 25 * 3600
            allowed, reason = await rl.check("6.6.6.6")
            self.assertTrue(allowed)
            self.assertIsNone(reason)

    async def test_ips_are_isolated(self):
        rl = RateLimiter(per_ip_per_min=2, per_ip_per_day=100, global_per_day=100)

        await rl.check("7.7.7.7")
        await rl.check("7.7.7.7")
        allowed, _ = await rl.check("7.7.7.7")
        self.assertFalse(allowed)

        # Different IP — unaffected
        allowed, _ = await rl.check("8.8.8.8")
        self.assertTrue(allowed)

    async def test_concurrent_checks_are_serialized(self):
        """Lock prevents two concurrent calls from both passing a cap of 1."""
        rl = RateLimiter(per_ip_per_min=1, per_ip_per_day=100, global_per_day=100)

        results = await asyncio.gather(
            rl.check("9.9.9.9"),
            rl.check("9.9.9.9"),
            rl.check("9.9.9.9"),
        )
        allowed_count = sum(1 for a, _ in results if a)
        self.assertEqual(allowed_count, 1)


if __name__ == "__main__":
    unittest.main()
