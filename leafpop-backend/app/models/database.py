"""
Typed representations of Supabase table rows (Section 5-10 of the spec).

These mirror the actual Postgres schema and are used for documentation/typing
only — the db layer (app/db/queries.py) works with plain dicts returned by
supabase-py directly, since that's what the client library gives us.

SQL to create these tables in the Supabase SQL editor:

    create table profiles (
        id uuid primary key references auth.users(id),
        username text not null,
        avatar_url text,
        created_at timestamptz default now(),
        total_pops integer default 0,
        best_score float default 0
    );

    create table leaves (
        id uuid primary key,
        user_id uuid references profiles(id),
        image_url text not null,
        file_path text not null,
        created_at timestamptz default now()
    );

    create table leaf_analyses (
        id uuid primary key,
        leaf_id uuid references leaves(id),
        leaf_type text, health_condition text, estimated_size text,
        color text, shape text, vein_density float, surface_condition text,
        dryness_score float, pop_potential int, predicted_loudness int,
        predicted_sharpness int, predicted_duration float, difficulty text,
        recommendation text, confidence float, created_at timestamptz default now()
    );

    create table pop_attempts (
        id uuid primary key,
        user_id uuid references profiles(id),
        leaf_id uuid references leaves(id),
        audio_url text, audio_hash text, source text default 'uploaded',
        audio_duration float, peak_amplitude float, rms_energy float,
        peak_frequency float, attack_time float, pop_duration float,
        noise_level float, signal_to_noise float,
        loudness_score float, sharpness_score float, clarity_score float,
        impact_score float, final_score float,
        created_at timestamptz default now()
    );

    create table virtual_attempts (
        id uuid primary key,
        user_id uuid references profiles(id),
        leaf_type text, tap_count int, total_duration float,
        max_velocity float, average_velocity float, reaction_time float,
        impact_x float, impact_y float, combo int,
        generated_pop_strength float, final_score float,
        created_at timestamptz default now()
    );

    -- Recommended indexes for leaderboard/history queries:
    create index on pop_attempts (final_score desc);
    create index on virtual_attempts (final_score desc);
    create index on pop_attempts (user_id, created_at desc);
    create index on virtual_attempts (user_id, created_at desc);
    create unique index on pop_attempts (audio_hash);
"""
from dataclasses import dataclass
from datetime import datetime


@dataclass
class ProfileRow:
    id: str
    username: str
    avatar_url: str | None
    created_at: datetime
    total_pops: int
    best_score: float


@dataclass
class LeafRow:
    id: str
    user_id: str
    image_url: str
    file_path: str
    created_at: datetime


@dataclass
class LeafAnalysisRow:
    id: str
    leaf_id: str
    leaf_type: str
    health_condition: str
    estimated_size: str
    color: str
    shape: str
    vein_density: float
    surface_condition: str
    dryness_score: float
    pop_potential: int
    predicted_loudness: int
    predicted_sharpness: int
    predicted_duration: float
    difficulty: str
    recommendation: str
    confidence: float
    created_at: datetime
