from __future__ import annotations

import json
import logging
import sqlite3
from pathlib import Path
from typing import Any, Iterator, Optional

from pymongo import MongoClient
from pymongo.database import Database
from pymongo.errors import OperationFailure
from sqlalchemy.orm import declarative_base

from .config import settings

logger = logging.getLogger(__name__)

_client: Optional[MongoClient] = None
Base = declarative_base()


def get_client() -> MongoClient:
    global _client
    if _client is None:
        _client = MongoClient(settings.MONGODB_URI, serverSelectionTimeoutMS=3000)
    return _client


def get_database_instance() -> Database:
    return get_client()[settings.MONGODB_DB_NAME]


def get_db() -> Iterator[Database]:
    yield get_database_instance()


def get_database() -> Iterator[Database]:
    yield from get_db()


def check_db_health() -> bool:
    try:
        get_client().admin.command("ping")
        return True
    except Exception as exc:
        logger.error("MongoDB health check failed: %s", exc)
        return False


def ensure_indexes(db: Database) -> None:
    index_specs = [
        ("users", {"keys": "email", "kwargs": {"unique": True, "sparse": True}}),
        ("users", {"keys": "phone_number", "kwargs": {"unique": True, "sparse": True}}),
        ("groups", {"keys": "join_code", "kwargs": {"unique": True, "sparse": True}}),
        ("groups", {"keys": "created_by", "kwargs": {}}),
        ("wallets", {"keys": "user_id", "kwargs": {"unique": True}}),
        ("wallet_transactions", {"keys": [("wallet_id", 1), ("created_at", -1)], "kwargs": {}}),
        ("payment_proofs", {"keys": [("group_id", 1), ("user_id", 1), ("round_number", 1)], "kwargs": {}}),
        ("winner_records", {"keys": [("group_id", 1), ("round_number", -1)], "kwargs": {}}),
        ("system_wallet_transactions", {"keys": [("created_at", -1)], "kwargs": {}}),
    ]
    for collection_name, spec in index_specs:
        try:
            _ensure_index(db[collection_name], spec["keys"], **spec["kwargs"])
        except OperationFailure as exc:
            logger.warning("Skipping conflicting index on %s: %s", collection_name, exc)


def _normalize_index_keys(keys: Any) -> list[tuple[str, int]]:
    if isinstance(keys, str):
        return [(keys, 1)]
    return list(keys)


def _default_index_name(keys: Any) -> str:
    return "_".join(f"{field}_{direction}" for field, direction in _normalize_index_keys(keys))


def _index_matches(existing: dict[str, Any], keys: Any, kwargs: dict[str, Any]) -> bool:
    existing_keys = existing.get("key", {})
    if isinstance(existing_keys, dict):
        existing_keys = list(existing_keys.items())
    else:
        existing_keys = list(existing_keys)

    if existing_keys != _normalize_index_keys(keys):
        return False

    for option_name in ("unique", "sparse"):
        expected = kwargs.get(option_name, False)
        actual = existing.get(option_name, False)
        if actual != expected:
            return False
    return True


def _ensure_index(collection, keys: Any, **kwargs: Any) -> None:
    requested_name = kwargs.get("name") or _default_index_name(keys)
    existing_indexes = collection.index_information()

    if requested_name and requested_name in existing_indexes:
        existing = existing_indexes[requested_name]
        if _index_matches(existing, keys, kwargs):
            return
        existing_keys = existing.get("key", {})
        if isinstance(existing_keys, dict):
            existing_keys = list(existing_keys.items())
        else:
            existing_keys = list(existing_keys)
        if existing_keys == _normalize_index_keys(keys):
            logger.info(
                "Keeping existing legacy index %s on %s because the keys match",
                requested_name,
                collection.name,
            )
            return

    for existing_name, existing in existing_indexes.items():
        if _index_matches(existing, keys, kwargs):
            return

    collection.create_index(keys, **kwargs)


def _sqlite_path() -> Optional[Path]:
    url = getattr(settings, "DATABASE_URL", "") or ""
    prefix = "sqlite:///"
    if not url.startswith(prefix):
        return None
    relative_path = url[len(prefix):]
    return Path(__file__).resolve().parents[2] / relative_path


def migrate_legacy_sqlite_to_mongo(db: Database) -> None:
    sqlite_path = _sqlite_path()
    if sqlite_path is None or not sqlite_path.exists():
        return

    if db["users"].count_documents({}) and db["groups"].count_documents({}):
        return

    logger.info("Migrating legacy SQLite data from %s to MongoDB", sqlite_path)
    conn = sqlite3.connect(sqlite_path)
    conn.row_factory = sqlite3.Row
    try:
        cur = conn.cursor()

        users = {}
        for row in cur.execute("SELECT * FROM users"):
            doc = dict(row)
            doc["_id"] = str(doc.pop("id"))
            for field in ("kyc_data", "address", "saved_beneficiaries", "withdrawal_settings", "notification_preferences", "profile_metadata", "app_settings", "privacy_settings", "security_settings", "active_sessions", "login_history"):
                value = doc.get(field)
                if isinstance(value, str) and value:
                    try:
                        doc[field] = json.loads(value)
                    except json.JSONDecodeError:
                        pass
            users[doc["_id"]] = doc
            db["users"].replace_one({"_id": doc["_id"]}, doc, upsert=True)

        group_members = {}
        try:
            for row in cur.execute("SELECT * FROM group_members"):
                member = dict(row)
                group_members.setdefault(str(member["group_id"]), []).append(member)
        except sqlite3.OperationalError:
            group_members = {}

        for row in cur.execute("SELECT * FROM groups"):
            doc = dict(row)
            group_id = str(doc.pop("id"))
            doc["_id"] = group_id
            rules = doc.get("rules")
            if isinstance(rules, str) and rules:
                try:
                    doc["rules"] = json.loads(rules)
                except json.JSONDecodeError:
                    doc["rules"] = {}
            members = []
            for member in sorted(group_members.get(group_id, []), key=lambda item: int(item.get("position") or 0)):
                user = users.get(str(member["user_id"]), {})
                members.append(
                    {
                        "user_id": str(member["user_id"]),
                        "joined_at": member.get("joined_at"),
                        "position": member.get("position"),
                        "contribution_count": int(member.get("contribution_count") or 0),
                        "received_payout": bool(member.get("received_payout")),
                        "payout_amount": float(member.get("payout_amount") or 0),
                        "payout_received_at": member.get("payout_received_at"),
                        "next_payment_due": member.get("next_payment_due"),
                        "missed_payments": int(member.get("missed_payments") or 0),
                        "total_contributed": float(member.get("total_contributed") or 0),
                        "full_name": user.get("full_name", "Unknown"),
                        "email": user.get("email", ""),
                    }
                )
            doc["members"] = members
            db["groups"].replace_one({"_id": group_id}, doc, upsert=True)

        try:
            for row in cur.execute("SELECT * FROM wallets"):
                doc = dict(row)
                doc["_id"] = str(doc.pop("id"))
                linked_accounts = doc.get("linked_accounts")
                if isinstance(linked_accounts, str) and linked_accounts:
                    try:
                        doc["linked_accounts"] = json.loads(linked_accounts)
                    except json.JSONDecodeError:
                        doc["linked_accounts"] = []
                db["wallets"].replace_one({"_id": doc["_id"]}, doc, upsert=True)
        except sqlite3.OperationalError:
            pass

        try:
            for row in cur.execute("SELECT * FROM wallet_transactions"):
                doc = dict(row)
                doc["_id"] = str(doc.pop("id"))
                metadata = doc.get("transaction_metadata")
                if isinstance(metadata, str) and metadata:
                    try:
                        doc["transaction_metadata"] = json.loads(metadata)
                    except json.JSONDecodeError:
                        pass
                db["wallet_transactions"].replace_one({"_id": doc["_id"]}, doc, upsert=True)
        except sqlite3.OperationalError:
            pass
    finally:
        conn.close()
