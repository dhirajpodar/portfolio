from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    GROQ_API_KEY: str = ""
    GEMINI_API_KEY: str = ""
    OPENAI_API_KEY: str = ""
    MODEL_NAME: str = "gemini-2.5-flash-lite"
    OPENAI_MODEL: str = "gpt-5.4-mini"
    CORS_ORIGINS: str = "*"

    # Email notifications (via Resend — https://resend.com)
    RESEND_API_KEY: str = ""
    NOTIFY_EMAIL: str = ""
    NOTIFY_FROM: str = "Portfolio Bot <onboarding@resend.dev>"
    EMAIL_NOTIFICATIONS_ENABLED: bool = False

    # Visitor geo-IP lookup (via ipinfo.io — https://ipinfo.io/signup)
    # Empty token falls back to unauthenticated (lower quota, still works).
    IPINFO_TOKEN: str = ""

    # Rate limits on /chat (protects LLM quota).
    # Grounded in Gemini 2.5 Flash Lite free tier (15 RPM / 1000 RPD) and
    # agent's 8-call-per-chat ceiling — see backend/CLAUDE.md.
    RATE_LIMIT_ENABLED: bool = True
    RATE_LIMIT_PER_IP_PER_MIN: int = 3
    RATE_LIMIT_PER_IP_PER_DAY: int = 20
    RATE_LIMIT_GLOBAL_PER_DAY: int = 250

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
