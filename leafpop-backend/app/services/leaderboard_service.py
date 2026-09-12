"""
Leaderboard (Sections 29-30). Derived from pop_attempts + virtual_attempts —
no separate leaderboard table needed.
"""
from app.db import queries


def get_leaderboard(mode: str = "all", limit: int = 10, source: str | None = None) -> list[dict]:
    mode = mode.lower()
    if mode not in ("real", "virtual", "all"):
        mode = "all"
    if source is not None and source.lower() not in ("uploaded", "recorded", "all"):
        source = None
    else:
        source = source.lower() if source else None

    rows = queries.fetch_leaderboard_rows(mode, limit=limit, source=source)

    leaderboard = []
    for i, row in enumerate(rows, start=1):
        leaderboard.append({
            "rank": i,
            "username": queries.get_username(row["user_id"]),
            "best_score": row.get("final_score", 0),
            "total_pops": 1,
            "score": row.get("final_score", 0),
            "mode": row.get("mode"),
            "source": row.get("source"),
            "audio_url": row.get("audio_url"),
            "created_at": row.get("created_at"),
        })
    return leaderboard
