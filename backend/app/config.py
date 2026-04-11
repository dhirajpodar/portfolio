from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    GROQ_API_KEY: str = ""
    MODEL_NAME: str = "moonshotai/kimi-k2-instruct"
    CORS_ORIGINS: str = "*"

    # Email notifications
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 465
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    NOTIFY_EMAIL: str = ""
    EMAIL_NOTIFICATIONS_ENABLED: bool = False

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
