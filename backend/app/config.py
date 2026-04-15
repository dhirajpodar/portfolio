from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    GROQ_API_KEY: str = ""
    GEMINI_API_KEY: str = ""
    MODEL_NAME: str = "gemini-2.5-flash-lite"
    CORS_ORIGINS: str = "*"

    # Email notifications (via Resend — https://resend.com)
    RESEND_API_KEY: str = ""
    NOTIFY_EMAIL: str = ""
    NOTIFY_FROM: str = "Portfolio Bot <onboarding@resend.dev>"
    EMAIL_NOTIFICATIONS_ENABLED: bool = False

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
