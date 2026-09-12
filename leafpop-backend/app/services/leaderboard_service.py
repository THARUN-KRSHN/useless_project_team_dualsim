"""
Leaderboard (Sections 29-30). Derived from pop_attempts + virtual_attempts —
no separate leaderboard table needed.
"""
from app.db import queries


def get_leaderboard(mode: str = "all", limit: int = 10) -> list[dict]:
    mode = mode.lower()
    if mode not in ("real", "virtual", "all"):
        mode = "all"

    rows = queries.fetch_leaderboard_rows(mode, limit=limit)

    leaderboard = []
    for i, row in enumerate(rows, start=1):
        leaderboard.append({
            "rank": i,
            "username": queries.get_username(row["user_id"]),
            "score": row.get("final_score", 0),
            "mode": row.get("mode"),
            "created_at": row.get("created_at"),
        })
    return leaderboard
