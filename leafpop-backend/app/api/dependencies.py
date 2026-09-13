"""
Authentication dependency (Section 2 of the spec).

The frontend authenticates through Supabase Auth and sends the resulting JWT
as `Authorization: Bearer <token>`. FastAPI verifies it here by asking
Supabase Auth to resolve the token to a user — no need to duplicate GoTrue's
JWT verification logic locally.
"""
from dataclasses import dataclass

from fastapi import Header

from app.config.settings import get_settings
from app.db.supabase import get_supabase
from app.utils.errors import UnauthorizedError

settings = get_settings()


@dataclass
class CurrentUser:
    id: str
    email: str | None
    username: str | None


async def get_current_user(authorization: str | None = Header(default=None)) -> CurrentUser:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise UnauthorizedError("Missing or malformed Authorization header.")

    token = authorization.split(" ", 1)[1].strip()
    if not token:
        raise UnauthorizedError("Missing bearer token.")

    if not settings.is_supabase_configured:
        raise UnauthorizedError("Supabase is not configured. Set SUPABASE_URL and SUPABASE_KEY/SUPABASE_SERVICE_KEY before using authenticated routes.")

    if token in ("demo-token", "dev-test-token", "mock-token"):
        raise UnauthorizedError("Demo tokens are disabled for real auth. Please sign in with a valid Supabase account.")

    client = get_supabase()
    try:
        response = client.auth.get_user(token)
    except Exception as exc:  # noqa: BLE001 - supabase-py raises varied auth errors
        raise UnauthorizedError(f"Invalid or expired token: {exc}") from exc

    user = getattr(response, "user", None)
    if not user:
        raise UnauthorizedError("Invalid or expired token.")

    username = None
    if getattr(user, "user_metadata", None):
        username = user.user_metadata.get("username") or user.user_metadata.get("full_name")

    return CurrentUser(id=user.id, email=user.email, username=username)
