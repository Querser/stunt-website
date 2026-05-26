import os
from functools import lru_cache
from pathlib import Path


def _split_csv(value: str) -> list[str]:
    return [item.strip() for item in value.split(",") if item.strip()]


class Settings:
    def __init__(self) -> None:
        self.app_env = os.getenv("APP_ENV", "development").lower()
        self.database_url = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./stunt_tech.db")
        self.secret_key = os.getenv("SECRET_KEY", "")
        self.access_token_expire_minutes = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", str(60 * 24)))

        self.admin_username = os.getenv("ADMIN_USERNAME", "admin")
        self.admin_password = os.getenv("ADMIN_PASSWORD", "stunt2026")
        self.admin_password_hash = os.getenv("ADMIN_PASSWORD_HASH")

        self.cors_origins = _split_csv(
            os.getenv("CORS_ORIGINS", "http://localhost:3001,http://127.0.0.1:3001")
        )
        self.trusted_hosts = _split_csv(os.getenv("TRUSTED_HOSTS", ""))
        self.public_backend_url = os.getenv("PUBLIC_BACKEND_URL", "").rstrip("/")
        self.public_site_url = os.getenv("PUBLIC_SITE_URL", "https://stunttech.ru").rstrip("/")

        self.uploads_dir = Path(os.getenv("UPLOADS_DIR", "uploads"))
        self.max_upload_bytes = int(os.getenv("MAX_UPLOAD_BYTES", str(10 * 1024 * 1024)))
        self.telegram_bot_token = os.getenv("TELEGRAM_BOT_TOKEN")
        self.telegram_chat_id = os.getenv("TELEGRAM_CHAT_ID")
        self.telegram_chat_ids = _split_csv(os.getenv("TELEGRAM_CHAT_IDS", ""))
        if self.telegram_chat_id and self.telegram_chat_id not in self.telegram_chat_ids:
            self.telegram_chat_ids.insert(0, self.telegram_chat_id)
        self.redis_url = os.getenv("REDIS_URL", "redis://redis:6379/0")
        self.cache_ttl_seconds = int(os.getenv("CACHE_TTL_SECONDS", "120"))
        self.cache_key_prefix = os.getenv("CACHE_KEY_PREFIX", "stunttech")
        self.woocommerce_enabled = os.getenv("WOOCOMMERCE_ENABLED", "true").lower() in {"1", "true", "yes", "on"}
        self.woocommerce_store_api_url = os.getenv(
            "WOOCOMMERCE_STORE_API_URL",
            "https://stunttech.ru/wp-json/wc/store/v1",
        ).rstrip("/")
        self.woocommerce_cache_ttl_seconds = int(os.getenv("WOOCOMMERCE_CACHE_TTL_SECONDS", "300"))
        self.woocommerce_per_page = int(os.getenv("WOOCOMMERCE_PER_PAGE", "100"))
        self.paykeeper_enabled = os.getenv("PAYKEEPER_ENABLED", "false").lower() in {"1", "true", "yes", "on"}
        self.paykeeper_form_url = os.getenv("PAYKEEPER_FORM_URL", "")
        self.paykeeper_secret_seed = os.getenv("PAYKEEPER_SECRET_SEED", "")
        self.paykeeper_server_url = os.getenv("PAYKEEPER_SERVER_URL", "").rstrip("/")
        self.paykeeper_username = os.getenv("PAYKEEPER_USERNAME", "")
        self.paykeeper_password = os.getenv("PAYKEEPER_PASSWORD", "")
        self.paykeeper_timeout_seconds = float(os.getenv("PAYKEEPER_TIMEOUT_SECONDS", "15"))
        self.vanta_enabled = os.getenv("VANTA_ENABLED", "false").lower() in {"1", "true", "yes", "on"}
        self.vanta_form_url = os.getenv("VANTA_FORM_URL", "").strip()
        self.vanta_partner_id = os.getenv("VANTA_PARTNER_ID", "")
        self.vanta_trade_id = os.getenv("VANTA_TRADE_ID", "")
        self.vanta_webhook_secret = os.getenv("VANTA_WEBHOOK_SECRET", "")
        self.vanta_application_type = os.getenv("VANTA_APPLICATION_TYPE", "credits")
        self.vanta_terms = _split_csv(os.getenv("VANTA_TERMS", "6,12,24,36"))

    @property
    def is_production(self) -> bool:
        return self.app_env == "production"

    def validate_for_startup(self) -> None:
        if self.is_production:
            if len(self.secret_key) < 32:
                raise RuntimeError("SECRET_KEY must be at least 32 characters in production")
            if not self.admin_password_hash:
                raise RuntimeError("ADMIN_PASSWORD_HASH is required in production")
            if not self.cors_origins:
                raise RuntimeError("CORS_ORIGINS must be configured in production")
        elif not self.secret_key:
            self.secret_key = "dev-only-stunt-tech-secret-key-change-before-production"


@lru_cache
def get_settings() -> Settings:
    settings = Settings()
    settings.validate_for_startup()
    return settings
