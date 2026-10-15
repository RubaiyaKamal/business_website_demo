"""Application settings, loaded from the environment (12-factor style)."""

from __future__ import annotations

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict

# Placeholder secrets that must never reach production.
_INSECURE_SECRETS = {
    "",
    "changeme",
    "change-me",
    "insecure-development-secret-change-me",
    "replace-me-with-a-long-random-secret",
}


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # --- Core ---
    environment: str = "development"
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    project_name: str = "GreenVolt Electronics API"
    api_v1_prefix: str = "/api/v1"
    backend_cors_origins: str = "http://localhost:3000"

    # --- Database ---
    database_url: str = "sqlite:///./greenvolt.db"

    # --- Auth / security ---
    secret_key: str = "insecure-development-secret-change-me"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60
    bcrypt_rounds: int = 12
    cookie_secure: bool = False
    cookie_domain: str | None = None
    enable_hsts: bool = False
    csrf_cookie_name: str = "gv_csrf"
    csrf_header_name: str = "x-csrf-token"
    session_cookie_name: str = "gv_access"

    # --- Feature flags ---
    enable_user_auth: bool = False
    enable_ai: bool = False
    public_site_url: str = "http://localhost:3000"

    # --- Seed admin ---
    admin_email: str | None = None
    admin_password: str | None = None
    admin_name: str = "GreenVolt Owner"

    # --- Email ---
    smtp_host: str | None = None
    smtp_port: int = 587
    smtp_user: str | None = None
    smtp_password: str | None = None
    smtp_use_tls: bool = True
    mail_from: str = "GreenVolt Electronics <no-reply@greenvolt.example>"
    mail_owner: str = "info@greenvolt.example"
    mail_suppress_send: bool = True

    # --- Rate limiting ---
    rate_limit_enabled: bool = True
    contact_rate_limit: str = "5/minute"
    login_rate_limit: str = "10/minute"

    # --- AI ---
    openai_api_key: str | None = None
    openai_model: str = "gpt-4o-mini"

    # --- Uploads ---
    media_root: str = "media/uploads"
    max_upload_mb: int = 5

    @property
    def cors_origins(self) -> list[str]:
        """Parse the comma-separated CORS origin list into a clean list."""
        return [origin.strip() for origin in self.backend_cors_origins.split(",") if origin.strip()]

    @property
    def is_production(self) -> bool:
        return self.environment.lower() in {"production", "prod"}

    @property
    def max_upload_bytes(self) -> int:
        return self.max_upload_mb * 1024 * 1024

    @property
    def uses_insecure_secret(self) -> bool:
        """True when SECRET_KEY is a known placeholder or too short to be safe."""
        return self.secret_key in _INSECURE_SECRETS or len(self.secret_key) < 32

    def enforce_production_secrets(self) -> None:
        """Fail fast if production is configured with an insecure secret."""
        if self.is_production and self.uses_insecure_secret:
            raise RuntimeError(
                "SECRET_KEY must be a long, random value in production. "
                'Generate one with: python -c "import secrets; print(secrets.token_urlsafe(64))"'
            )


@lru_cache
def get_settings() -> Settings:
    """Return a cached Settings instance."""
    return Settings()


settings = get_settings()
