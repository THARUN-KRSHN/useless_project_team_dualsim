"""
Thin data-access layer. Routes/services call these functions instead of
touching the Supabase client directly, so the storage/DB backend could be
swapped later without rewriting business logic.

Includes in-memory mock storage & DB fallbacks when running in development
mode without active Supabase credentials.
"""
import uuid
from datetime import datetime, timezone

from app.config.constants import (
    TABLE_PROFILES, TABLE_LEAVES, TABLE_LEAF_ANALYSES,
    TABLE_POP_ATTEMPTS, TABLE_VIRTUAL_ATTEMPTS,
)
from app.config.settings import get_settings
from app.db.supabase import get_supabase
from app.utils.errors import DatabaseError, StorageError

settings = get_settings()

# In-memory database store for dev fallback
_MOCK_DB: dict[str, dict[str, dict]] = {
    TABLE_PROFILES: {},
    TABLE_LEAVES: {},
    TABLE_LEAF_ANALYSES: {},
    TABLE_POP_ATTEMPTS: {},
    TABLE_VIRTUAL_ATTEMPTS: {},
}


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _new_id() -> str:
    return str(uuid.uuid4())


def _is_dev() -> bool:
    return settings.environment == "development" or not settings.is_supabase_configured


# ---------------------------------------------------------------------------
# Storage
# ---------------------------------------------------------------------------

def upload_to_storage(bucket: str, path: str, content: bytes, content_type: str) -> str:
    """Uploads bytes to a Supabase Storage bucket and returns a public URL."""
    if _is_dev():
        mock_url = f"data:{content_type};base64," + __import__("base64").b64encode(content).decode("ascii")
        from app.services.image_service import _MOCK_STORAGE_FILES
        _MOCK_STORAGE_FILES[mock_url] = content
        return mock_url

    try:
        client = get_supabase()
        client.storage.from_(bucket).upload(
            path=path,
            file=content,
            file_options={"content-type": content_type, "upsert": "true"},
        )
        return client.storage.from_(bucket).get_public_url(path)
    except Exception as exc:  # noqa: BLE001
        if _is_dev():
            mock_url = f"data:{content_type};base64," + __import__("base64").b64encode(content).decode("ascii")
            from app.services.image_service import _MOCK_STORAGE_FILES
            _MOCK_STORAGE_FILES[mock_url] = content
            return mock_url
        raise StorageError(f"Failed to upload to storage: {exc}") from exc


# ---------------------------------------------------------------------------
# profiles
# ---------------------------------------------------------------------------

def _normalize_username(username: str | None, user_id: str | None = None) -> str:
    candidate = (username or "").strip()
    if candidate:
        return candidate
    if user_id and user_id.lower() == "demo-user-123":
        return "DemoPopper"
    return "Leaf Popper"


def get_or_create_profile(user_id: str, username: str | None = None) -> dict:
    normalized_username = _normalize_username(username, user_id)
    if _is_dev():
        if user_id in _MOCK_DB[TABLE_PROFILES]:
            return _MOCK_DB[TABLE_PROFILES][user_id]
        profile = {
            "id": user_id,
            "username": normalized_username,
            "avatar_url": None,
            "created_at": _now_iso(),
            "total_pops": 0,
            "best_score": 0.0,
        }
        _MOCK_DB[TABLE_PROFILES][user_id] = profile
        return profile

    try:
        client = get_supabase()
        result = client.table(TABLE_PROFILES).select("*").eq("id", user_id).limit(1).execute()
        if result.data:
            return result.data[0]
        new_profile = {
            "id": user_id,
            "username": normalized_username,
            "avatar_url": None,
            "created_at": _now_iso(),
            "total_pops": 0,
            "best_score": 0.0,
        }
        client.table(TABLE_PROFILES).insert(new_profile).execute()
        return new_profile
    except Exception as exc:  # noqa: BLE001
        if _is_dev():
            profile = {
                "id": user_id,
                "username": normalized_username,
                "avatar_url": None,
                "created_at": _now_iso(),
                "total_pops": 0,
                "best_score": 0.0,
            }
            _MOCK_DB[TABLE_PROFILES][user_id] = profile
            return profile
        raise DatabaseError(f"Failed to fetch/create profile: {exc}") from exc


def update_profile_stats(user_id: str, new_score: float) -> None:
    if _is_dev():
        profile = get_or_create_profile(user_id)
        profile["total_pops"] = int(profile.get("total_pops", 0)) + 1
        profile["best_score"] = max(float(profile.get("best_score", 0.0)), new_score)
        _MOCK_DB[TABLE_PROFILES][user_id] = profile
        return

    try:
        client = get_supabase()
        profile = get_or_create_profile(user_id)
        updates = {
            "total_pops": int(profile.get("total_pops", 0)) + 1,
            "best_score": max(float(profile.get("best_score", 0.0)), new_score),
        }
        client.table(TABLE_PROFILES).update(updates).eq("id", user_id).execute()
    except Exception as exc:  # noqa: BLE001
        if _is_dev():
            profile = get_or_create_profile(user_id)
            profile["total_pops"] = int(profile.get("total_pops", 0)) + 1
            profile["best_score"] = max(float(profile.get("best_score", 0.0)), new_score)
            _MOCK_DB[TABLE_PROFILES][user_id] = profile
            return
        raise DatabaseError(f"Failed to update profile stats: {exc}") from exc


# ---------------------------------------------------------------------------
# leaves
# ---------------------------------------------------------------------------

def create_leaf_record(user_id: str, image_url: str, file_path: str) -> dict:
    record = {
        "id": _new_id(),
        "user_id": user_id,
        "image_url": image_url,
        "file_path": file_path,
        "created_at": _now_iso(),
    }
    if _is_dev():
        _MOCK_DB[TABLE_LEAVES][record["id"]] = record
        return record

    try:
        client = get_supabase()
        client.table(TABLE_LEAVES).insert(record).execute()
        return record
    except Exception as exc:  # noqa: BLE001
        if _is_dev():
            _MOCK_DB[TABLE_LEAVES][record["id"]] = record
            return record
        raise DatabaseError(f"Failed to save leaf record: {exc}") from exc


def get_leaf_by_id(leaf_id: str) -> dict | None:
    if _is_dev() and leaf_id in _MOCK_DB[TABLE_LEAVES]:
        return _MOCK_DB[TABLE_LEAVES][leaf_id]

    try:
        client = get_supabase()
        result = client.table(TABLE_LEAVES).select("*").eq("id", leaf_id).limit(1).execute()
        if result.data:
            return result.data[0]
        return _MOCK_DB[TABLE_LEAVES].get(leaf_id)
    except Exception as exc:  # noqa: BLE001
        if _is_dev():
            return _MOCK_DB[TABLE_LEAVES].get(leaf_id)
        raise DatabaseError(f"Failed to fetch leaf: {exc}") from exc


# ---------------------------------------------------------------------------
# leaf_analyses
# ---------------------------------------------------------------------------

def save_leaf_analysis(leaf_id: str, features: dict, prediction: dict) -> dict:
    record = {
        "id": _new_id(),
        "leaf_id": leaf_id,
        "leaf_type": features.get("leaf_type"),
        "health_condition": features.get("health_condition"),
        "estimated_size": features.get("estimated_size"),
        "color": features.get("color"),
        "shape": features.get("shape"),
        "vein_density": features.get("vein_density"),
        "surface_condition": features.get("surface_condition"),
        "dryness_score": features.get("dryness_score"),
        "pop_potential": prediction.get("pop_potential"),
        "predicted_loudness": prediction.get("predicted_loudness"),
        "predicted_sharpness": prediction.get("predicted_sharpness"),
        "predicted_duration": prediction.get("predicted_duration"),
        "difficulty": prediction.get("difficulty"),
        "recommendation": prediction.get("recommendation"),
        "confidence": prediction.get("confidence"),
        "created_at": _now_iso(),
    }
    if _is_dev():
        _MOCK_DB[TABLE_LEAF_ANALYSES][record["id"]] = record
        return record

    try:
        client = get_supabase()
        client.table(TABLE_LEAF_ANALYSES).insert(record).execute()
        return record
    except Exception as exc:  # noqa: BLE001
        if _is_dev():
            _MOCK_DB[TABLE_LEAF_ANALYSES][record["id"]] = record
            return record
        raise DatabaseError(f"Failed to save leaf analysis: {exc}") from exc


def get_latest_analysis_for_leaf(leaf_id: str) -> dict | None:
    if _is_dev():
        matches = [r for r in _MOCK_DB[TABLE_LEAF_ANALYSES].values() if r.get("leaf_id") == leaf_id]
        if matches:
            matches.sort(key=lambda r: r.get("created_at", ""), reverse=True)
            return matches[0]

    try:
        client = get_supabase()
        result = (
            client.table(TABLE_LEAF_ANALYSES)
            .select("*").eq("leaf_id", leaf_id)
            .order("created_at", desc=True).limit(1).execute()
        )
        if result.data:
            return result.data[0]
        matches = [r for r in _MOCK_DB[TABLE_LEAF_ANALYSES].values() if r.get("leaf_id") == leaf_id]
        return matches[0] if matches else None
    except Exception as exc:  # noqa: BLE001
        if _is_dev():
            matches = [r for r in _MOCK_DB[TABLE_LEAF_ANALYSES].values() if r.get("leaf_id") == leaf_id]
            return matches[0] if matches else None
        raise DatabaseError(f"Failed to fetch leaf analysis: {exc}") from exc


# ---------------------------------------------------------------------------
# pop_attempts
# ---------------------------------------------------------------------------

def save_pop_attempt(user_id: str, leaf_id: str | None, audio_url: str,
                      audio_features: dict, score_breakdown: dict,
                      audio_hash: str, source: str = "uploaded") -> dict:
    source = source if source in {"uploaded", "recorded"} else "uploaded"
    record = {
        "id": _new_id(),
        "user_id": user_id,
        "leaf_id": leaf_id,
        "audio_url": audio_url,
        "audio_hash": audio_hash,
        "audio_duration": audio_features.get("audio_duration"),
        "peak_amplitude": audio_features.get("peak_amplitude"),
        "rms_energy": audio_features.get("rms_energy"),
        "peak_frequency": audio_features.get("peak_frequency"),
        "attack_time": audio_features.get("attack_time"),
        "pop_duration": audio_features.get("pop_duration"),
        "noise_level": audio_features.get("noise_level"),
        "signal_to_noise": audio_features.get("signal_to_noise"),
        "loudness_score": score_breakdown.get("loudness"),
        "sharpness_score": score_breakdown.get("sharpness"),
        "clarity_score": score_breakdown.get("clarity"),
        "impact_score": score_breakdown.get("impact"),
        "final_score": score_breakdown.get("final_score"),
        "created_at": _now_iso(),
    }
    if source == "recorded":
        record["source"] = "recorded"
    else:
        record["source"] = "uploaded"

    if _is_dev():
        _MOCK_DB[TABLE_POP_ATTEMPTS][record["id"]] = record
        return record

    try:
        client = get_supabase()
        client.table(TABLE_POP_ATTEMPTS).insert(record).execute()
        return record
    except Exception as exc:  # noqa: BLE001
        if _is_dev():
            _MOCK_DB[TABLE_POP_ATTEMPTS][record["id"]] = record
            return record
        if "source" in str(exc) and "does not exist" in str(exc):
            safe_record = {k: v for k, v in record.items() if k != "source"}
            client.table(TABLE_POP_ATTEMPTS).insert(safe_record).execute()
            return safe_record
        raise DatabaseError(f"Failed to save pop attempt: {exc}") from exc


def find_pop_attempt_by_hash(audio_hash: str) -> dict | None:
    if _is_dev():
        for r in _MOCK_DB[TABLE_POP_ATTEMPTS].values():
            if r.get("audio_hash") == audio_hash:
                return {"id": r["id"]}

    try:
        client = get_supabase()
        result = (
            client.table(TABLE_POP_ATTEMPTS).select("id")
            .eq("audio_hash", audio_hash).limit(1).execute()
        )
        if result.data:
            return result.data[0]
        for r in _MOCK_DB[TABLE_POP_ATTEMPTS].values():
            if r.get("audio_hash") == audio_hash:
                return {"id": r["id"]}
        return None
    except Exception as exc:  # noqa: BLE001
        if _is_dev():
            for r in _MOCK_DB[TABLE_POP_ATTEMPTS].values():
                if r.get("audio_hash") == audio_hash:
                    return {"id": r["id"]}
            return None
        raise DatabaseError(f"Failed to check duplicate submission: {exc}") from exc


def get_pop_attempt(pop_id: str) -> dict | None:
    if _is_dev() and pop_id in _MOCK_DB[TABLE_POP_ATTEMPTS]:
        return _MOCK_DB[TABLE_POP_ATTEMPTS][pop_id]

    try:
        client = get_supabase()
        result = client.table(TABLE_POP_ATTEMPTS).select("*").eq("id", pop_id).limit(1).execute()
        if result.data:
            return result.data[0]
        return _MOCK_DB[TABLE_POP_ATTEMPTS].get(pop_id)
    except Exception as exc:  # noqa: BLE001
        if _is_dev():
            return _MOCK_DB[TABLE_POP_ATTEMPTS].get(pop_id)
        raise DatabaseError(f"Failed to fetch pop attempt: {exc}") from exc


def count_recent_pop_attempts(user_id: str, since_iso: str) -> int:
    if _is_dev():
        return sum(1 for r in _MOCK_DB[TABLE_POP_ATTEMPTS].values()
                   if r.get("user_id") == user_id and r.get("created_at", "") >= since_iso)

    try:
        client = get_supabase()
        result = (
            client.table(TABLE_POP_ATTEMPTS).select("id", count="exact")
            .eq("user_id", user_id).gte("created_at", since_iso).execute()
        )
        return result.count or 0
    except Exception as exc:  # noqa: BLE001
        if _is_dev():
            return sum(1 for r in _MOCK_DB[TABLE_POP_ATTEMPTS].values()
                       if r.get("user_id") == user_id and r.get("created_at", "") >= since_iso)
        raise DatabaseError(f"Failed to rate-limit pop attempts: {exc}") from exc


def get_user_pop_attempts(user_id: str, limit: int = 50) -> list[dict]:
    if _is_dev():
        user_pops = [r for r in _MOCK_DB[TABLE_POP_ATTEMPTS].values() if r.get("user_id") == user_id]
        user_pops.sort(key=lambda r: r.get("created_at", ""), reverse=True)
        return user_pops[:limit]

    try:
        client = get_supabase()
        result = (
            client.table(TABLE_POP_ATTEMPTS).select("*")
            .eq("user_id", user_id).order("created_at", desc=True).limit(limit).execute()
        )
        if result.data:
            return result.data
        user_pops = [r for r in _MOCK_DB[TABLE_POP_ATTEMPTS].values() if r.get("user_id") == user_id]
        user_pops.sort(key=lambda r: r.get("created_at", ""), reverse=True)
        return user_pops[:limit]
    except Exception as exc:  # noqa: BLE001
        if _is_dev():
            user_pops = [r for r in _MOCK_DB[TABLE_POP_ATTEMPTS].values() if r.get("user_id") == user_id]
            user_pops.sort(key=lambda r: r.get("created_at", ""), reverse=True)
            return user_pops[:limit]
        raise DatabaseError(f"Failed to fetch pop history: {exc}") from exc


# ---------------------------------------------------------------------------
# virtual_attempts
# ---------------------------------------------------------------------------

def save_virtual_attempt(user_id: str, interaction: dict, score_breakdown: dict) -> dict:
    record = {
        "id": _new_id(),
        "user_id": user_id,
        "leaf_type": interaction.get("leaf_type"),
        "tap_count": interaction.get("tap_count"),
        "total_duration": interaction.get("total_duration"),
        "max_velocity": interaction.get("max_velocity"),
        "average_velocity": interaction.get("average_velocity"),
        "reaction_time": interaction.get("reaction_time"),
        "impact_x": interaction.get("impact_x"),
        "impact_y": interaction.get("impact_y"),
        "combo": interaction.get("combo"),
        "generated_pop_strength": score_breakdown.get("pop_strength"),
        "final_score": score_breakdown.get("final_score"),
        "created_at": _now_iso(),
    }
    if _is_dev():
        _MOCK_DB[TABLE_VIRTUAL_ATTEMPTS][record["id"]] = record
        return record

    try:
        client = get_supabase()
        client.table(TABLE_VIRTUAL_ATTEMPTS).insert(record).execute()
        return record
    except Exception as exc:  # noqa: BLE001
        if _is_dev():
            _MOCK_DB[TABLE_VIRTUAL_ATTEMPTS][record["id"]] = record
            return record
        raise DatabaseError(f"Failed to save virtual attempt: {exc}") from exc


def get_user_virtual_attempts(user_id: str, limit: int = 50) -> list[dict]:
    if _is_dev():
        user_v = [r for r in _MOCK_DB[TABLE_VIRTUAL_ATTEMPTS].values() if r.get("user_id") == user_id]
        user_v.sort(key=lambda r: r.get("created_at", ""), reverse=True)
        return user_v[:limit]

    try:
        client = get_supabase()
        result = (
            client.table(TABLE_VIRTUAL_ATTEMPTS).select("*")
            .eq("user_id", user_id).order("created_at", desc=True).limit(limit).execute()
        )
        if result.data:
            return result.data
        user_v = [r for r in _MOCK_DB[TABLE_VIRTUAL_ATTEMPTS].values() if r.get("user_id") == user_id]
        user_v.sort(key=lambda r: r.get("created_at", ""), reverse=True)
        return user_v[:limit]
    except Exception as exc:  # noqa: BLE001
        if _is_dev():
            user_v = [r for r in _MOCK_DB[TABLE_VIRTUAL_ATTEMPTS].values() if r.get("user_id") == user_id]
            user_v.sort(key=lambda r: r.get("created_at", ""), reverse=True)
            return user_v[:limit]
        raise DatabaseError(f"Failed to fetch virtual attempt history: {exc}") from exc


def count_recent_virtual_attempts(user_id: str, since_iso: str) -> int:
    if _is_dev():
        return sum(1 for r in _MOCK_DB[TABLE_VIRTUAL_ATTEMPTS].values()
                   if r.get("user_id") == user_id and r.get("created_at", "") >= since_iso)

    try:
        client = get_supabase()
        result = (
            client.table(TABLE_VIRTUAL_ATTEMPTS).select("id", count="exact")
            .eq("user_id", user_id).gte("created_at", since_iso).execute()
        )
        return result.count or 0
    except Exception as exc:  # noqa: BLE001
        if _is_dev():
            return sum(1 for r in _MOCK_DB[TABLE_VIRTUAL_ATTEMPTS].values()
                       if r.get("user_id") == user_id and r.get("created_at", "") >= since_iso)
        raise DatabaseError(f"Failed to rate-limit virtual attempts: {exc}") from exc


# ---------------------------------------------------------------------------
# Leaderboard
# ---------------------------------------------------------------------------

def fetch_leaderboard_rows(mode: str, limit: int = 10, source: str | None = None) -> list[dict]:
    """mode: 'real' | 'virtual' | 'all'; source: 'uploaded' | 'recorded' | None"""
    rows: list[dict] = []

    def _filter_source(row: dict) -> bool:
        if source in (None, "all"):
            return True
        return (row.get("source") or "uploaded") == source

    if _is_dev():
        if mode in ("real", "all"):
            for r in _MOCK_DB[TABLE_POP_ATTEMPTS].values():
                if not _filter_source(r):
                    continue
                rows.append({
                    "user_id": r["user_id"],
                    "final_score": r["final_score"],
                    "created_at": r["created_at"],
                    "audio_url": r.get("audio_url"),
                    "source": r.get("source", "uploaded"),
                    "mode": "real",
                })
        if mode in ("virtual", "all"):
            for r in _MOCK_DB[TABLE_VIRTUAL_ATTEMPTS].values():
                rows.append({
                    "user_id": r["user_id"],
                    "final_score": r["final_score"],
                    "created_at": r["created_at"],
                    "audio_url": None,
                    "source": "virtual",
                    "mode": "virtual",
                })
        rows.sort(key=lambda r: r.get("final_score", 0), reverse=True)
        return rows[:limit]

    try:
        client = get_supabase()
        if mode in ("real", "all"):
            try:
                real_query = client.table(TABLE_POP_ATTEMPTS).select("user_id, final_score, created_at, audio_url, source")
                if source not in (None, "all"):
                    real_query = real_query.eq("source", source)
                real = real_query.order("final_score", desc=True).limit(limit).execute()
            except Exception as exc:  # noqa: BLE001
                if "source" in str(exc) and "does not exist" in str(exc):
                    real = client.table(TABLE_POP_ATTEMPTS).select("user_id, final_score, created_at, audio_url").order("final_score", desc=True).limit(limit).execute()
                    for r in real.data or []:
                        rows.append({**r, "source": "uploaded", "mode": "real"})
                    rows.sort(key=lambda r: r.get("final_score", 0), reverse=True)
                    return rows[:limit]
                raise
            for r in real.data or []:
                rows.append({**r, "mode": "real"})

        if mode in ("virtual", "all"):
            virtual = (
                client.table(TABLE_VIRTUAL_ATTEMPTS)
                .select("user_id, final_score, created_at")
                .order("final_score", desc=True).limit(limit).execute()
            )
            for r in virtual.data or []:
                rows.append({**r, "audio_url": None, "source": "virtual", "mode": "virtual"})

        rows.sort(key=lambda r: r.get("final_score", 0), reverse=True)
        return rows[:limit]
    except Exception as exc:  # noqa: BLE001
        if _is_dev():
            if mode in ("real", "all"):
                for r in _MOCK_DB[TABLE_POP_ATTEMPTS].values():
                    if not _filter_source(r):
                        continue
                    rows.append({
                        "user_id": r["user_id"],
                        "final_score": r["final_score"],
                        "created_at": r["created_at"],
                        "audio_url": r.get("audio_url"),
                        "source": r.get("source", "uploaded"),
                        "mode": "real",
                    })
            if mode in ("virtual", "all"):
                for r in _MOCK_DB[TABLE_VIRTUAL_ATTEMPTS].values():
                    rows.append({
                        "user_id": r["user_id"],
                        "final_score": r["final_score"],
                        "created_at": r["created_at"],
                        "audio_url": None,
                        "source": "virtual",
                        "mode": "virtual",
                    })
            rows.sort(key=lambda r: r.get("final_score", 0), reverse=True)
            return rows[:limit]
        raise DatabaseError(f"Failed to build leaderboard: {exc}") from exc


def get_username(user_id: str) -> str:
    if user_id == "demo-user-123":
        return "DemoPopper"
    if _is_dev() and user_id in _MOCK_DB[TABLE_PROFILES]:
        username = _MOCK_DB[TABLE_PROFILES][user_id].get("username")
        return username or "Leaf Popper"

    try:
        client = get_supabase()
        result = client.table(TABLE_PROFILES).select("username").eq("id", user_id).limit(1).execute()
        if result.data:
            username = result.data[0].get("username")
            if username:
                return username
            return "Leaf Popper"
        found = _MOCK_DB[TABLE_PROFILES].get(user_id, {})
        username = found.get("username")
        if username:
            return username
        return "Leaf Popper"
    except Exception:  # noqa: BLE001
        return "Leaf Popper"
