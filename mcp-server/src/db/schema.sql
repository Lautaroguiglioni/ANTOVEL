-- Antovel MCP — SQLite Schema
-- Designed for local-first persistence of the Legacy Brain.
-- All vectors are stored as BLOB (Float32Array serialized).

CREATE TABLE IF NOT EXISTS memories (
  id              TEXT PRIMARY KEY,
  user_id         TEXT NOT NULL,
  type            TEXT NOT NULL CHECK(type IN ('photo','audio','video','note')),
  title           TEXT NOT NULL,
  date            TEXT NOT NULL,                     -- ISO date yyyy-mm-dd
  description     TEXT,
  tags            TEXT,                              -- JSON array
  location_name   TEXT,
  location_lat    REAL,
  location_lng    REAL,
  color           TEXT,
  therapeutic_tag TEXT,                               -- identity|family_bond|life_milestone|happy_place|daily_anchor|sensory
  source          TEXT DEFAULT 'self',                -- self|family|caregiver|ai_extracted
  donor_name      TEXT,
  donor_relation  TEXT,
  injection_note  TEXT,
  injection_status TEXT DEFAULT 'pending',            -- pending|approved|active
  is_family_donation INTEGER DEFAULT 0,
  duration        TEXT,                               -- for audio/video
  media_url       TEXT,
  thumbnail_url   TEXT,
  embedding       BLOB,                               -- vector float32 serialized
  created_at      TEXT DEFAULT (datetime('now')),
  updated_at      TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS essence_documents (
  id                    TEXT PRIMARY KEY,
  patient_id            TEXT NOT NULL,
  patient_name          TEXT,
  identity_affirmation  TEXT,
  key_people            TEXT,                         -- JSON: EssencePerson[]
  lifeline              TEXT,                         -- JSON: EssenceLifelineEvent[]
  daily_anchors         TEXT,                         -- JSON: string[]
  reminiscence_prompts  TEXT,                         -- JSON: EssencePrompt[]
  emergency_contact     TEXT,                         -- JSON: EssenceEmergencyContact
  updated_by            TEXT,
  updated_at            TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS memory_training (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  memory_id        TEXT NOT NULL,
  prompt           TEXT NOT NULL,                     -- Question asked to the patient
  patient_response TEXT,                              -- What they answered
  recalled         INTEGER,                           -- 1 = remembered, 0 = didn't
  confidence       INTEGER,                           -- 0-100
  session_date     TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (memory_id) REFERENCES memories(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS family_relatos (
  id               TEXT PRIMARY KEY,
  patient_id       TEXT,
  author_name      TEXT,
  author_relation  TEXT,
  content          TEXT,
  tags             TEXT,                              -- JSON array
  embedding        BLOB,
  created_at       TEXT DEFAULT (datetime('now'))
);

-- Performance indices
CREATE INDEX IF NOT EXISTS idx_memories_user_date   ON memories(user_id, date);
CREATE INDEX IF NOT EXISTS idx_memories_user_tag    ON memories(user_id, therapeutic_tag);
CREATE INDEX IF NOT EXISTS idx_training_memory      ON memory_training(memory_id);
CREATE INDEX IF NOT EXISTS idx_essence_patient      ON essence_documents(patient_id);
CREATE INDEX IF NOT EXISTS idx_relatos_patient      ON family_relatos(patient_id);
