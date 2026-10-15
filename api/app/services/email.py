"""Outgoing email: owner notifications and visitor auto-replies.

All delivery goes through :func:`send_email`. When ``mail_suppress_send`` is set
(the default in development) or no SMTP host is configured, messages are logged
instead of sent so the app never depends on a live mail server locally.
"""

from __future__ import annotations

import logging
import smtplib
from email.message import EmailMessage

from app.core.config import settings

logger = logging.getLogger("greenvolt.email")


def send_email(
    *,
    to: str,
    subject: str,
    body: str,
    reply_to: str | None = None,
) -> bool:
    """Send a plain-text email. Returns True when actually delivered."""
    message = EmailMessage()
    message["From"] = settings.mail_from
    message["To"] = to
    message["Subject"] = subject
    if reply_to:
        message["Reply-To"] = reply_to
    message.set_content(body)
    return _deliver(message)


def _deliver(message: EmailMessage) -> bool:
    if settings.mail_suppress_send or not settings.smtp_host:
        logger.info(
            "Email suppressed (dev mode) to=%s subject=%s", message["To"], message["Subject"]
        )
        return False
    try:
        with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=15) as smtp:
            if settings.smtp_use_tls:
                smtp.starttls()
            if settings.smtp_user and settings.smtp_password:
                smtp.login(settings.smtp_user, settings.smtp_password)
            smtp.send_message(message)
    except (OSError, smtplib.SMTPException):
        logger.exception("Failed to send email to %s", message["To"])
        return False
    return True


def owner_address() -> str:
    """Where owner notifications are delivered."""
    return settings.mail_owner or "info@greenvolt.example"


def notify_new_inquiry(
    *,
    name: str,
    email: str,
    phone: str | None,
    subject: str,
    message: str,
    service_name: str | None = None,
) -> None:
    """Notify the shop owner and acknowledge receipt to the visitor."""
    body_lines = [
        "A new enquiry has arrived through the GreenVolt Electronics website.",
        "",
        f"Name:    {name}",
        f"Email:   {email}",
        f"Phone:   {phone or '—'}",
        f"Service: {service_name or '—'}",
        f"Subject: {subject}",
        "",
        "Message:",
        message,
        "",
        f"Manage enquiries: {settings.public_site_url}/en/admin/inquiries",
    ]
    send_email(
        to=owner_address(),
        subject=f"New enquiry: {subject}",
        body="\n".join(body_lines),
        reply_to=email,
    )

    send_email(
        to=email,
        subject="Thanks for contacting GreenVolt Electronics",
        body="\n".join(
            [
                f"Hi {name},",
                "",
                "Thanks for reaching out to GreenVolt Electronics. We have received your "
                "message and a member of our team will get back to you shortly.",
                "",
                "Your message:",
                f"  {subject}",
                "",
                "Power Up Your Life.",
                "— The GreenVolt Electronics team",
            ]
        ),
    )
