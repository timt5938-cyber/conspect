import os
from pathlib import Path
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional, Any

BASE_DIR = Path(__file__).resolve().parent.parent
ROOT_DIR = BASE_DIR.parent

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=str(ROOT_DIR / ".env") if (ROOT_DIR / ".env").exists() else None,
        env_file_encoding="utf-8",
        extra="ignore"
    )

    # Gemini AI
    GEMINI_API_KEY: Optional[str] = None
    GEMINI_MODEL: str = "gemini-2.5-flash"

    # Supabase (conspect)
    SUPABASE_URL: str = "https://ddvzcqeunaappryvbuov.supabase.co"
    SUPABASE_KEY: str = "sb_publishable_qt25E54VIPTgokQZwkMasw_1H1KkbP3"
    SUPABASE_ANON_KEY: str = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkdnpjcWV1bmFhcHByeXZidW92Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEyODg2OTEsImV4cCI6MjEwNjg2NDY5MX0.BEmdtY1kQFusiCnsmtGrXYTMIwmpUY2cD0PilLje6tU"
    SUPABASE_BUCKET: str = "conspectus-assets"

    # Web App & Server
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000

    # Paths
    BASE_DIR: Path = BASE_DIR
    ROOT_DIR: Path = ROOT_DIR
    STORAGE_DIR: Path = ROOT_DIR / "storage"
    PRESETS_DIR: Path = BASE_DIR / "static" / "presets"
    TEMPLATES_DIR: Path = BASE_DIR / "static" / "templates"

    @field_validator("API_PORT", mode="before")
    @classmethod
    def validate_api_port(cls, v: Any) -> int:
        if v is None or v == "" or (isinstance(v, str) and not v.strip()):
            return 8000
        try:
            return int(v)
        except Exception:
            return 8000

    @field_validator("GEMINI_API_KEY", mode="before")
    @classmethod
    def validate_gemini_key(cls, v: Any) -> Optional[str]:
        if v is None or v == "" or (isinstance(v, str) and not v.strip()):
            return None
        return str(v)

    @field_validator("SUPABASE_URL", mode="before")
    @classmethod
    def validate_supabase_url(cls, v: Any) -> str:
        if v is None or v == "" or (isinstance(v, str) and not v.strip()):
            return "https://ddvzcqeunaappryvbuov.supabase.co"
        return str(v)

    @field_validator("SUPABASE_KEY", mode="before")
    @classmethod
    def validate_supabase_key(cls, v: Any) -> str:
        if v is None or v == "" or (isinstance(v, str) and not v.strip()):
            return "sb_publishable_qt25E54VIPTgokQZwkMasw_1H1KkbP3"
        return str(v)

    @field_validator("SUPABASE_ANON_KEY", mode="before")
    @classmethod
    def validate_supabase_anon_key(cls, v: Any) -> str:
        if v is None or v == "" or (isinstance(v, str) and not v.strip()):
            return "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkdnpjcWV1bmFhcHByeXZidW92Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEyODg2OTEsImV4cCI6MjEwNjg2NDY5MX0.BEmdtY1kQFusiCnsmtGrXYTMIwmpUY2cD0PilLje6tU"
        return str(v)

settings = Settings()

# Ensure directories exist
try:
    settings.STORAGE_DIR.mkdir(parents=True, exist_ok=True)
    settings.PRESETS_DIR.mkdir(parents=True, exist_ok=True)
    settings.TEMPLATES_DIR.mkdir(parents=True, exist_ok=True)
except Exception:
    pass
