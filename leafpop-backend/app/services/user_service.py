"""
Personal statistics and pop history (Sections 31-32).
"""
from app.db import queries


def get_current_user_profile(user_id: str, username: str | None, email: str | None) -> dict:
    profile = queries.get_or_create_profile(user_id, username)
    return {"id": profile["id"], "username": profile["username"], "email": email}


def get_user_stats(user_id: str) -> dict:
    profile = queries.get_or_create_profile(user_id)
    pop_attempts = queries.get_user_pop_attempts(user_id, limit=1000)
    virtual_attempts = queries.get_user_virtual_attempts(user_id, limit=1000)

    all_scores = [p["final_score"] for p in pop_attempts] + [v["final_score"] for v in virtual_attempts]
    average_score = round(sum(all_scores) / len(all_scores), 1) if all_scores else 0.0

    leaves_analyzed = len({p["leaf_id"] for p in pop_attempts if p.get("leaf_id")})

    leaderboard = queries.fetch_leaderboard_rows("all", limit=1000)
    global_rank = None
    for i, row in enumerate(leaderboard, start=1):
        if row.get("user_id") == user_id:
            global_rank = i
            break

    return {
        "total_pops": int(profile.get("total_pops", 0)),
        "best_score": float(profile.get("best_score", 0.0)),
        "average_score": average_score,
        "real_pops": len(pop_attempts),
        "virtual_pops": len(virtual_attempts),
        "leaves_analyzed": leaves_analyzed,
        "global_rank": global_rank,
    }


def get_user_pop_history(user_id: str, limit: int = 50) -> list[dict]:
    real = [
        {"id": p["id"], "mode": "real", "score": p["final_score"], "created_at": p["created_at"]}
        for p in queries.get_user_pop_attempts(user_id, limit=limit)
    ]
    virtual = [
        {"id": v["id"], "mode": "virtual", "score": v["final_score"], "created_at": v["created_at"]}
        for v in queries.get_user_virtual_attempts(user_id, limit=limit)
    ]
    combined = sorted(real + virtual, key=lambda r: r["created_at"], reverse=True)
    return combined[:limit]
