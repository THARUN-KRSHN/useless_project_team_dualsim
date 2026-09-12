<<<<<<< HEAD
# 🍃 LeafPop AI — Backend

> Analyze → Predict → Pop → Measure → Score → Compete.

FastAPI backend for LeafPop AI: upload a leaf photo and get an AI-predicted
"Pop Potential", pop the real leaf and get it scored from the audio, or skip
the leaf entirely and play the virtual tap-to-pop mode. Everything feeds one
shared leaderboard.

## Stack

- **Python 3.11+ / FastAPI** — API layer
- **Supabase** — PostgreSQL, Storage (leaf images + pop audio), Auth
- **OpenCV / Pillow / NumPy** — leaf image analysis
- **Librosa / SciPy** — pop audio analysis
- **Pydantic** — request/response validation

## Project layout

```
app/
├── main.py                # FastAPI app, router registration, error handlers
├── config/                # settings.py (env vars), constants.py (weights, bands)
├── api/
│   ├── dependencies.py    # Supabase JWT auth dependency
│   └── routes/            # one file per resource
├── services/               # business logic — routes stay thin
├── ml/                     # leaf_features, leaf_predictor, audio_features
├── models/                 # DB row dataclasses + the SQL schema (see database.py)
├── schemas/                 # Pydantic request/response models
├── db/                      # supabase.py (client), queries.py (data access)
└── utils/                   # file validation, scoring math, audio helpers, errors
tests/                       # pytest suite (no external services required)
```

## Setup

```bash
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env            # then fill in your Supabase project details
```

### Supabase setup

1. Create a project at supabase.com.
2. Run the SQL in `app/models/database.py` (top-of-file docstring) in the
   Supabase SQL editor — it creates `profiles`, `leaves`, `leaf_analyses`,
   `pop_attempts`, `virtual_attempts`, plus the recommended indexes.
3. Create two **public** storage buckets: `leaf-images` and `pop-audio`.
4. Copy your project URL, anon key, and service-role key into `.env`.

### Run it

```bash
uvicorn app.main:app --reload
```

- API base: `http://localhost:8000/api/v1`
- Interactive docs: `http://localhost:8000/docs`

### Run tests

```bash
pytest
```

The test suite uses synthetic images/audio generated in-memory — no
Supabase connection or real leaf/recording needed to run it.

## API summary

| Method | Endpoint                      | Auth | Purpose            |
| ------ | ------------------------------ | ---- | ------------------ |
| GET    | `/api/v1/health`               | No   | Health check |
| GET    | `/api/v1/auth/me`               | Yes  | Current user profile |
| POST   | `/api/v1/leaves/upload`         | Yes  | Upload leaf image |
| POST   | `/api/v1/leaves/{id}/analyze`   | Yes  | Run AI leaf analysis |
| GET    | `/api/v1/leaves/{id}`           | No   | Get leaf + analysis report |
| POST   | `/api/v1/pops/upload`           | Yes  | Upload real pop recording, get scored |
| GET    | `/api/v1/pops/{id}`             | No   | Get a stored pop result |
| POST   | `/api/v1/virtual/pop`           | Yes  | Submit virtual tap interaction, get scored |
| GET    | `/api/v1/leaderboard`           | No   | `?mode=real\|virtual\|all&limit=10` |
| GET    | `/api/v1/users/me/stats`        | Yes  | Personal stats |
| GET    | `/api/v1/users/me/pops`         | Yes  | Pop history (real + virtual) |

All protected endpoints expect `Authorization: Bearer <supabase_jwt>`.

## Design principles baked in

- **Never trust the frontend score.** `pops/upload` and `virtual/pop` only
  accept raw metrics (audio bytes / tap velocity, reaction time, etc.) — the
  backend always calculates the final score server-side.
- **Files never touch the database.** Images and audio go to Supabase
  Storage; only the resulting URL is stored in Postgres.
- **Anti-cheat included.** Duplicate audio uploads (by SHA-256 hash) are
  rejected, and both pop endpoints are rate-limited per user per minute.
- **Rule-based MVP, ML-ready.** `ml/leaf_predictor.py` uses a transparent
  weighted formula (Section 17 of the spec). Once you've collected real
  `(features, actual_score)` pairs from `pop_attempts` joined to
  `leaf_analyses`, swap in a trained `RandomForestRegressor` there without
  touching any route or service code.
- **Consistent errors.** Every failure returns
  `{"success": false, "error": {"code": ..., "message": ...}}` — see
  `app/utils/errors.py` for the full code list.
- **AI vs Actual.** When a real pop is tied to a previously analyzed leaf
  (`leaf_id` passed to `/pops/upload`), the response includes a
  `prediction_comparison` block (predicted vs. actual, and by how much).

## Development order (matches the spec's Section 48)

1. Foundation — FastAPI, Supabase connection, health check, error handling ✅
2. Auth — Supabase Auth + JWT verification ✅
3. Leaf upload — validation, storage, `leaves` table ✅
4. Leaf analysis — OpenCV features, prediction, `leaf_analyses` table ✅
5. Real pop — audio upload, pop detection, scoring, `pop_attempts` table ✅
6. Virtual pop — interaction scoring, `virtual_attempts` table ✅
7. Leaderboard — global ranking, personal stats, pop history ✅
8. Polish — achievements, better error messages, API docs (next: your call)

Once this is solid end-to-end, move on to the frontend (React/Next.js) and
point it at `/api/v1`.
=======
<img width="1280" height="640" alt="git (1)" src="https://github.com/user-attachments/assets/8920b256-2ba8-4988-b824-5351134eb4bd" />



# [Project Name] 🎯


## Basic Details
### Team Name: [Name]


### Team Members
- Team Lead: [Name] - [College]
- Member 2: [Name] - [College]
- Member 3: [Name] - [College]

### Project Description
[2-3 lines about what your project does]

### The Problem (that doesn't exist)
[What ridiculous problem are you solving?]

### The Solution (that nobody asked for)
[How are you solving it? Keep it fun!]

## Technical Details
### Technologies/Components Used
For Software:
- [Languages used]
- [Frameworks used]
- [Libraries used]
- [Tools used]

For Hardware:
- [List main components]
- [List specifications]
- [List tools required]

### Implementation
For Software:
# Installation
[commands]

# Run
[commands]

### Project Documentation
For Software:

# Screenshots (Add at least 3)
![Screenshot1](Add screenshot 1 here with proper name)
*Add caption explaining what this shows*

![Screenshot2](Add screenshot 2 here with proper name)
*Add caption explaining what this shows*

![Screenshot3](Add screenshot 3 here with proper name)
*Add caption explaining what this shows*

# Diagrams
![Workflow](Add your workflow/architecture diagram here)
*Add caption explaining your workflow*

For Hardware:

# Schematic & Circuit
![Circuit](Add your circuit diagram here)
*Add caption explaining connections*

![Schematic](Add your schematic diagram here)
*Add caption explaining the schematic*

# Build Photos
![Components](Add photo of your components here)
*List out all components shown*

![Build](Add photos of build process here)
*Explain the build steps*

![Final](Add photo of final product here)
*Explain the final build*

### Project Demo
# Video
[Add your demo video link here]
*Explain what the video demonstrates*

# Additional Demos
[Add any extra demo materials/links]

## Team Contributions
- [Name 1]: [Specific contributions]
- [Name 2]: [Specific contributions]
- [Name 3]: [Specific contributions]

---
Made with ❤️ at TinkerHub Useless Projects 

![Static Badge](https://img.shields.io/badge/TinkerHub-24?color=%23000000&link=https%3A%2F%2Fwww.tinkerhub.org%2F)
![Static Badge](https://img.shields.io/badge/UselessProjects--26-26?link=https%3A%2F%2Ftinkerhub.org%2Fevents%2F1M8ORET9A1%2Fuseless-projects-3.0)



>>>>>>> origin/main
