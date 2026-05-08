import asyncio
import logging
from datetime import datetime, timezone

import httpx

from app.config import settings

logger = logging.getLogger(__name__)

RESEND_API_URL = "https://api.resend.com/emails"
IPINFO_URL = "https://ipinfo.io/{ip}/json"

_PRIVATE_IP_PREFIXES = (
    "127.", "10.", "192.168.",
    "172.16.", "172.17.", "172.18.", "172.19.",
    "172.20.", "172.21.", "172.22.", "172.23.",
    "172.24.", "172.25.", "172.26.", "172.27.",
    "172.28.", "172.29.", "172.30.", "172.31.",
    "::1", "fc", "fd", "fe80",
)


def _lookup_geo(ip: str) -> dict:
    """Look up geo/ISP info for an IP via ipinfo.io. Never raises; returns {} on any failure."""
    if not ip or ip == "bogon" or ip.startswith(_PRIVATE_IP_PREFIXES):
        return {}
    try:
        headers = {}
        if settings.IPINFO_TOKEN:
            headers["Authorization"] = f"Bearer {settings.IPINFO_TOKEN}"
        response = httpx.get(IPINFO_URL.format(ip=ip), headers=headers, timeout=3)
        response.raise_for_status()
        data = response.json()
        if data.get("bogon"):
            return {}
        return data
    except Exception as e:
        logger.warning(f"ipinfo.io lookup failed for {ip}: {e}")
        return {}


def _format_visitor_block(
    client_ip: str,
    user_agent: str,
    referer: str,
    accept_language: str,
    geo: dict,
) -> str:
    lines = ["--- Visitor ---", f"IP:       {client_ip or '(unknown)'}"]
    if geo:
        loc_parts = [geo.get("city"), geo.get("region"), geo.get("country")]
        loc = ", ".join(p for p in loc_parts if p)
        if loc:
            lines.append(f"Location: {loc}")
        if geo.get("org"):
            lines.append(f"Org:      {geo['org']}")
    lines.append(f"Browser:  {user_agent or '(none)'}")
    lines.append(f"Referer:  {referer or '(direct)'}")
    lines.append(f"Language: {accept_language or '(none)'}")
    return "\n".join(lines)


def send_question_email(
    question: str,
    thread_id: str,
    timestamp: str,
    client_ip: str,
    user_agent: str,
    referer: str,
    accept_language: str,
) -> None:
    """Send an email notification for a new chat question. Never raises."""
    try:
        geo = _lookup_geo(client_ip)
        visitor_block = _format_visitor_block(client_ip, user_agent, referer, accept_language, geo)
        _do_send_email(question, thread_id, timestamp, visitor_block)
        logger.info(f"Email notification sent for thread {thread_id}")
    except Exception as e:
        logger.error(f"Failed to send email notification: {e}")


def _do_send_email(question: str, thread_id: str, timestamp: str, visitor_block: str) -> None:
    """Send an email notification via Resend API. Raises on failure."""
    body = (
        f"New question received on your portfolio chatbot.\n\n"
        f"Question: {question}\n"
        f"Thread ID: {thread_id}\n"
        f"Timestamp: {timestamp} UTC\n\n"
        f"{visitor_block}"
    )
    response = httpx.post(
        RESEND_API_URL,
        headers={"Authorization": f"Bearer {settings.RESEND_API_KEY}"},
        json={
            "from": settings.NOTIFY_FROM,
            "to": [settings.NOTIFY_EMAIL],
            "subject": "Portfolio Chat: New Question",
            "text": body,
        },
        timeout=10,
    )
    response.raise_for_status()


async def notify_new_question(
    question: str,
    thread_id: str,
    client_ip: str = "",
    user_agent: str = "",
    referer: str = "",
    accept_language: str = "",
) -> None:
    """Fire-and-forget async email notification, enriched with visitor metadata."""
    if not settings.EMAIL_NOTIFICATIONS_ENABLED:
        logger.debug("Email notifications disabled (EMAIL_NOTIFICATIONS_ENABLED=false)")
        return
    if not settings.RESEND_API_KEY:
        logger.warning("Email notifications enabled but RESEND_API_KEY is not set")
        return
    timestamp = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")
    await asyncio.to_thread(
        send_question_email,
        question,
        thread_id,
        timestamp,
        client_ip,
        user_agent,
        referer,
        accept_language,
    )
