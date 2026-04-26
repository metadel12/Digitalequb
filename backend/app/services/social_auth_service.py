from __future__ import annotations

import json
from datetime import timedelta
from typing import Any
from urllib.parse import urlencode

import httpx
from jose import jwt
from pymongo.database import Database

from app.core.config import settings
from app.core.mongo_utils import ensure_utc_datetime, new_id, utcnow


class SocialAuthService:
    PROVIDERS = {
        "google": {
            "authorize_url": "https://accounts.google.com/o/oauth2/v2/auth",
            "token_url": "https://oauth2.googleapis.com/token",
            "jwks_url": "https://www.googleapis.com/oauth2/v3/certs",
            "userinfo_url": "https://www.googleapis.com/oauth2/v3/userinfo",
            "issuer": "https://accounts.google.com",
            "scope": "openid email profile",
        },
        "apple": {
            "authorize_url": "https://appleid.apple.com/auth/authorize",
            "token_url": "https://appleid.apple.com/auth/token",
            "jwks_url": "https://appleid.apple.com/auth/keys",
            "issuer": "https://appleid.apple.com",
            "scope": "name email",
        },
    }

    def __init__(self, db: Database):
        self.db = db

    def _client_id(self, provider: str) -> str | None:
        return getattr(settings, f"{provider.upper()}_CLIENT_ID", None)

    def _redirect_uri(self, provider: str) -> str | None:
        return getattr(settings, f"{provider.upper()}_REDIRECT_URI", None)

    def _client_secret(self, provider: str) -> str | None:
        if provider == "google":
            return settings.GOOGLE_CLIENT_SECRET
        if provider == "apple":
            if not all([settings.APPLE_TEAM_ID, settings.APPLE_KEY_ID, settings.APPLE_PRIVATE_KEY, settings.APPLE_CLIENT_ID]):
                return None
            now = int(utcnow().timestamp())
            headers = {"kid": settings.APPLE_KEY_ID}
            payload = {
                "iss": settings.APPLE_TEAM_ID,
                "iat": now,
                "exp": now + 300,
                "aud": "https://appleid.apple.com",
                "sub": settings.APPLE_CLIENT_ID,
            }
            return jwt.encode(payload, settings.APPLE_PRIVATE_KEY.replace("\\n", "\n"), algorithm="ES256", headers=headers)
        return None

    def is_configured(self, provider: str) -> bool:
        return bool(self._client_id(provider) and self._redirect_uri(provider) and self._client_secret(provider))

    def create_state(self, provider: str) -> str:
        state = new_id()
        self.db["session_codes"].insert_one(
            {
                "_id": state,
                "token": state,
                "type": "oauth_state",
                "provider": provider,
                "used": False,
                "created_at": utcnow(),
                "expires_at": utcnow() + timedelta(minutes=10),
            }
        )
        return state

    def build_auth_url(self, provider: str) -> str:
        config = self.PROVIDERS[provider]
        state = self.create_state(provider)
        params = {
            "client_id": self._client_id(provider),
            "redirect_uri": self._redirect_uri(provider),
            "response_type": "code",
            "scope": config["scope"],
            "state": state,
        }
        if provider == "google":
            params["access_type"] = "offline"
            params["prompt"] = "select_account"
        if provider == "apple":
            params["response_mode"] = "form_post"
        return f"{config['authorize_url']}?{urlencode(params)}"

    def get_valid_state_record(self, provider: str, state: str) -> dict[str, Any] | None:
        record = self.db["session_codes"].find_one(
            {"token": state, "type": "oauth_state", "provider": provider, "used": False}
        )
        expires_at = ensure_utc_datetime((record or {}).get("expires_at"))
        if not record or not expires_at or expires_at < utcnow():
            return None
        return record

    def consume_state(self, record_id: str) -> None:
        self.db["session_codes"].update_one(
            {"_id": record_id},
            {"$set": {"used": True, "used_at": utcnow()}},
        )

    async def exchange_code(self, provider: str, code: str) -> dict[str, Any]:
        config = self.PROVIDERS[provider]
        async with httpx.AsyncClient(timeout=20.0) as client:
            response = await client.post(
                config["token_url"],
                data={
                    "code": code,
                    "client_id": self._client_id(provider),
                    "client_secret": self._client_secret(provider),
                    "redirect_uri": self._redirect_uri(provider),
                    "grant_type": "authorization_code",
                },
                headers={
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Accept": "application/json",
                },
            )
            if response.status_code != 200:
                raise ValueError(f"Token exchange failed: {response.status_code} {response.text}")
            return response.json()

    async def _get_google_userinfo(self, access_token: str) -> dict[str, Any]:
        """Fetch user info from Google userinfo endpoint using the access token."""
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.get(
                self.PROVIDERS["google"]["userinfo_url"],
                headers={"Authorization": f"Bearer {access_token}"},
            )
            if response.status_code != 200:
                raise ValueError(f"Google userinfo fetch failed: {response.status_code} {response.text}")
            return response.json()

    async def _jwks(self, provider: str) -> list[dict[str, Any]]:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.get(self.PROVIDERS[provider]["jwks_url"])
            response.raise_for_status()
            return response.json().get("keys", [])

    async def verify_id_token(self, provider: str, id_token: str) -> dict[str, Any]:
        """Verify id_token using JWKS — fully async, no blocking google-auth library."""
        header = jwt.get_unverified_header(id_token)
        keys = await self._jwks(provider)
        key = next((k for k in keys if k.get("kid") == header.get("kid")), None)
        if not key:
            # kid mismatch can happen if JWKS rotated — try any key
            if keys:
                key = keys[0]
            else:
                raise ValueError("No JWKS keys available to verify token")
        claims = jwt.decode(
            id_token,
            key,
            algorithms=[header.get("alg", "RS256")],
            audience=self._client_id(provider),
            issuer=self.PROVIDERS[provider]["issuer"],
        )
        return claims

    async def resolve_user_info(self, provider: str, code: str, callback_user_payload: str | None = None) -> dict[str, Any]:
        tokens = await self.exchange_code(provider, code)

        # For Google: use userinfo endpoint as primary source (more reliable than id_token decode)
        # Fall back to id_token if userinfo fails
        if provider == "google":
            try:
                claims = await self._get_google_userinfo(tokens["access_token"])
            except Exception:
                claims = await self.verify_id_token(provider, tokens["id_token"])
        else:
            claims = await self.verify_id_token(provider, tokens["id_token"])

        callback_user: dict[str, Any] = {}
        if callback_user_payload:
            try:
                callback_user = json.loads(callback_user_payload)
            except json.JSONDecodeError:
                pass

        full_name = claims.get("name")
        if not full_name:
            first_name = callback_user.get("name", {}).get("firstName")
            last_name = callback_user.get("name", {}).get("lastName")
            full_name = " ".join(p for p in [first_name, last_name] if p).strip() or claims.get("email", "DigiEqub User")

        # Google userinfo uses "sub" for id, same as id_token claims
        return {
            "provider": provider,
            "provider_user_id": claims.get("sub"),
            "email": claims.get("email"),
            "full_name": full_name,
            "email_verified_by_provider": bool(claims.get("email_verified", provider == "apple")),
        }
