import asyncio
import logging
import smtplib
import ssl
from datetime import datetime, timezone
from email.mime.text import MIMEText

from app.config import settings

logger = logging.getLogger(__name__)


def send_question_email(question: str, thread_id: str, timestamp: str) -> None:
    """Send an email notification for a new chat question. Never raises."""
    try:
        body = (
            f"New question received on your portfolio chatbot.\n\n"
            f"Question: {question}\n"
            f"Thread ID: {thread_id}\n"
            f"Timestamp: {timestamp} UTC"
        )
        msg = MIMEText(body)
        msg["Subject"] = "Portfolio Chat: New Question"
        msg["From"] = settings.SMTP_USER
        msg["To"] = settings.NOTIFY_EMAIL

        context = ssl.create_default_context()
        with smtplib.SMTP_SSL(settings.SMTP_HOST, settings.SMTP_PORT, context=context) as server:
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.sendmail(settings.SMTP_USER, settings.NOTIFY_EMAIL, msg.as_string())

        logger.info(f"Email notification sent for thread {thread_id}")
    except Exception as e:
        logger.error(f"Failed to send email notification: {e}")


async def notify_new_question(question: str, thread_id: str) -> None:
    """Fire-and-forget async email notification."""
    if not settings.EMAIL_NOTIFICATIONS_ENABLED or not settings.SMTP_USER:
        return
    timestamp = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")
    await asyncio.to_thread(send_question_email, question, thread_id, timestamp)
