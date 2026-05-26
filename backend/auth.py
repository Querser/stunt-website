import hmac
from datetime import datetime, timedelta, timezone

import bcrypt
import jwt
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from jwt import InvalidTokenError

from config import get_settings


ALGORITHM = "HS256"
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/admin/login")
settings = get_settings()


def verify_admin_credentials(username: str, password: str) -> bool:
    if not hmac.compare_digest(username, settings.admin_username):
        return False

    if settings.admin_password_hash:
        try:
            return bcrypt.checkpw(password.encode("utf-8"), settings.admin_password_hash.encode("utf-8"))
        except ValueError:
            return False

    if settings.is_production:
        return False

    return hmac.compare_digest(password, settings.admin_password)


def create_access_token(data: dict) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.access_token_expire_minutes)
    payload = data.copy()
    payload.update({"exp": expire})
    return jwt.encode(payload, settings.secret_key, algorithm=ALGORITHM)


def verify_token(token: str = Depends(oauth2_scheme)) -> str:
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[ALGORITHM])
        username = payload.get("sub")
        if not username:
            raise HTTPException(
                status_code=401,
                detail="Неверный токен",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return username
    except InvalidTokenError:
        raise HTTPException(
            status_code=401,
            detail="Ошибка валидации токена",
            headers={"WWW-Authenticate": "Bearer"},
        )
