from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    OPENROUTER_API_KEY: str = ""
    # Free, tool-calling + reasoning capable. Reasoning streams to the thinking
    # panel; a non-reasoning model here simply shows nothing there.
    OPENROUTER_MODEL: str = "deepseek/deepseek-v4-flash"
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
    # Grounded in the OpenRouter free-model daily cap and the agent's
    # 8-call-per-chat ceiling — see backend/CLAUDE.md.
    RATE_LIMIT_ENABLED: bool = True
    RATE_LIMIT_PER_IP_PER_MIN: int = 6
    RATE_LIMIT_PER_IP_PER_DAY: int = 40
    RATE_LIMIT_GLOBAL_PER_DAY: int = 500

    # extra="ignore": tolerate unrelated env vars (e.g. GROQ_API_KEY, used only
    # at build time by scripts/build_index.py) instead of erroring on them.
    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "extra": "ignore",
    }


settings = Settings()
