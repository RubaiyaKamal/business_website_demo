"""Email notifications: suppress mode, SMTP delivery and inquiry wiring."""

from __future__ import annotations

from email.message import EmailMessage
from typing import Any

import pytest

from app.core.config import settings
from app.services import email as email_service


class FakeSMTP:
    """Minimal smtplib.SMTP stand-in that records sent messages."""

    instances: list[FakeSMTP] = []

    def __init__(self, host: str, port: int, timeout: int = 15) -> None:
        self.host = host
        self.port = port
        self.messages: list[EmailMessage] = []
        FakeSMTP.instances.append(self)

    def __enter__(self) -> FakeSMTP:
        return self

    def __exit__(self, *exc: object) -> bool:
        return False

    def starttls(self) -> None:
        pass

    def login(self, user: str, password: str) -> None:
        pass

    def send_message(self, message: EmailMessage) -> None:
        self.messages.append(message)


@pytest.fixture(autouse=True)
def _reset_smtp() -> None:
    FakeSMTP.instances.clear()


def _all_messages() -> list[EmailMessage]:
    return [msg for instance in FakeSMTP.instances for msg in instance.messages]


def test_send_email_suppressed_by_default() -> None:
    assert email_service.send_email(to="x@greenvolt.com", subject="Hi", body="Body") is False


def test_send_email_delivers_via_smtp(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(settings, "mail_suppress_send", False)
    monkeypatch.setattr(settings, "smtp_host", "smtp.greenvolt.com")
    monkeypatch.setattr(email_service.smtplib, "SMTP", FakeSMTP)

    sent = email_service.send_email(
        to="owner@greenvolt.com", subject="Hello", body="Body", reply_to="a@greenvolt.com"
    )

    assert sent is True
    messages = _all_messages()
    assert len(messages) == 1
    assert messages[0]["To"] == "owner@greenvolt.com"
    assert messages[0]["Reply-To"] == "a@greenvolt.com"


def test_notify_new_inquiry_sends_owner_and_autoreply(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(settings, "mail_suppress_send", False)
    monkeypatch.setattr(settings, "smtp_host", "smtp.greenvolt.com")
    monkeypatch.setattr(email_service.smtplib, "SMTP", FakeSMTP)

    email_service.notify_new_inquiry(
        name="Ahmed",
        email="ahmed@greenvolt.com",
        phone="0300 1234567",
        subject="Laptop repair",
        message="My screen is cracked.",
        service_name="Laptop Repair",
    )

    messages = _all_messages()
    assert len(messages) == 2
    recipients = {msg["To"] for msg in messages}
    assert "ahmed@greenvolt.com" in recipients


def test_inquiry_submission_triggers_notification(
    admin_client: Any, monkeypatch: pytest.MonkeyPatch
) -> None:
    from app.api.v1.endpoints import inquiries as inquiries_endpoint

    calls: list[dict[str, Any]] = []

    def record(**kwargs: Any) -> None:
        calls.append(kwargs)

    monkeypatch.setattr(inquiries_endpoint, "notify_new_inquiry", record)

    response = admin_client.post(
        "/api/v1/inquiries",
        json={
            "name": "Ahmed",
            "email": "ahmed@greenvolt.com",
            "subject": "Laptop repair",
            "message": "My laptop screen is cracked please advise.",
        },
    )

    assert response.status_code == 201
    assert len(calls) == 1
    assert calls[0]["email"] == "ahmed@greenvolt.com"
