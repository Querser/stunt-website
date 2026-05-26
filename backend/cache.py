import json
import logging
from typing import Any

from redis.asyncio import Redis
from redis.exceptions import RedisError

from config import get_settings


logger = logging.getLogger(__name__)
settings = get_settings()
_redis: Redis | None = None


def _key(key: str) -> str:
    return f"{settings.cache_key_prefix}:{key}"


def _pattern(pattern: str) -> str:
    return f"{settings.cache_key_prefix}:{pattern}"


def get_redis() -> Redis | None:
    if not settings.redis_url:
        return None

    global _redis
    if _redis is None:
        _redis = Redis.from_url(settings.redis_url, decode_responses=True)
    return _redis


async def close_redis() -> None:
    if _redis is not None:
        await _redis.aclose()


async def ping_redis() -> bool:
    client = get_redis()
    if client is None:
        return False

    try:
        return bool(await client.ping())
    except RedisError:
        logger.exception("Redis ping failed")
        return False


async def get_json(key: str) -> Any | None:
    client = get_redis()
    if client is None:
        return None

    try:
        raw = await client.get(_key(key))
    except RedisError:
        logger.exception("Redis read failed for key %s", key)
        return None

    if raw is None:
        return None
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        logger.warning("Redis cache payload is not valid JSON for key %s", key)
        return None


async def set_json(key: str, value: Any, ttl_seconds: int | None = None) -> None:
    client = get_redis()
    if client is None:
        return

    ttl = ttl_seconds or settings.cache_ttl_seconds
    try:
        raw = json.dumps(value, ensure_ascii=False, separators=(",", ":"))
        await client.set(_key(key), raw, ex=ttl)
    except (RedisError, TypeError):
        logger.exception("Redis write failed for key %s", key)


async def delete_patterns(*patterns: str) -> None:
    client = get_redis()
    if client is None:
        return

    try:
        keys: list[str] = []
        for pattern in patterns:
            async for key in client.scan_iter(match=_pattern(pattern), count=100):
                keys.append(key)
        if keys:
            await client.delete(*keys)
    except RedisError:
        logger.exception("Redis invalidation failed for patterns %s", patterns)
