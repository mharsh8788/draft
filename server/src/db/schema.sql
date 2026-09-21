-- Bayern Draft PostgreSQL Schema

CREATE TABLE IF NOT EXISTS players (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    position VARCHAR(10) NOT NULL,
    secondary_positions JSONB DEFAULT '[]'::jsonb,
    nationality VARCHAR(50) NOT NULL,
    flag VARCHAR(10),
    era VARCHAR(50) NOT NULL,
    age INT,
    overall INT NOT NULL,
    appearances INT NOT NULL DEFAULT 0,
    goals INT NOT NULL DEFAULT 0,
    assists INT NOT NULL DEFAULT 0,
    trophies INT NOT NULL DEFAULT 0,
    champions_league_titles INT NOT NULL DEFAULT 0,
    bundesliga_titles INT NOT NULL DEFAULT 0,
    bio TEXT,
    achievements JSONB DEFAULT '[]'::jsonb
);

CREATE TABLE IF NOT EXISTS drafts (
    id VARCHAR(100) PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'playing',
    current_round INT DEFAULT 1,
    formation VARCHAR(20) DEFAULT '4-3-3'
);

CREATE TABLE IF NOT EXISTS draft_picks (
    id SERIAL PRIMARY KEY,
    draft_id VARCHAR(100) NOT NULL REFERENCES drafts(id) ON DELETE CASCADE,
    player_id VARCHAR(50) NOT NULL REFERENCES players(id),
    round_number INT NOT NULL,
    team VARCHAR(20) NOT NULL CHECK (team IN ('user', 'opponent')),
    position VARCHAR(20) NOT NULL,
    was_mystery BOOLEAN NOT NULL DEFAULT FALSE,
    picked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_draft_picks_draft_id ON draft_picks(draft_id);
CREATE INDEX IF NOT EXISTS idx_players_position ON players(position);
