import asyncio
import logging
from datetime import datetime, timezone

import httpx

from app.config import settings

logger = logging.getLogger(__name__)

RESEND_API_URL = "https://api.resend.com/emails"


def send_question_email(question: str, thread_id: str, timestamp: str) -> None:
    """Send an email notification for a new chat question. Never raises."""
    try:
        _do_send_email(question, thread_id, timestamp)
        logger.info(f"Email notification sent for thread {thread_id}")
    except Exception as e:
        logger.error(f"Failed to send email notification: {e}")


def _do_send_email(question: str, thread_id: str, timestamp: str) -> None:
    """Send an email notification via Resend API. Raises on failure."""
    body = (
        f"New question received on your portfolio chatbot.\n\n"
        f"Question: {question}\n"
        f"Thread ID: {thread_id}\n"
        f"Timestamp: {timestamp} UTC"
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


async def notify_new_question(question: str, thread_id: str) -> None:
    """Fire-and-forget async email notification."""
    if not settings.EMAIL_NOTIFICATIONS_ENABLED or not settings.RESEND_API_KEY:
        return
    timestamp = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")
    await asyncio.to_thread(send_question_email, question, thread_id, timestamp)
