import pg from 'pg';
import dotenv from 'dotenv';
import { PLAYERS, isPositionEligible } from '../data/players.js';

dotenv.config();

const { Pool } = pg;

let pool = null;
let usePostgres = false;

// In-memory / cache store for drafts and picks
const memoryStore = {
  drafts: new Map(),
  picks: new Map(), // draftId -> array of picks
  players: [...PLAYERS]
};

// Check if PostgreSQL connection is configured
if (process.env.DATABASE_URL || process.env.PGUSER || process.env.PGHOST) {
  try {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      user: process.env.PGUSER || 'postgres',
      host: process.env.PGHOST || 'localhost',
      database: process.env.PGDATABASE || 'bayern_draft',
      password: process.env.PGPASSWORD || 'postgres',
      port: process.env.PGPORT ? parseInt(process.env.PGPORT, 10) : 5432,
      connectionTimeoutMillis: 2000
    });

    // Test connection
    pool.query('SELECT NOW()', (err) => {
      if (err) {
        console.warn('⚠️  PostgreSQL connection unavailable. Falling back to built-in verified dataset store.');
        usePostgres = false;
      } else {
        console.log('✅ Connected to PostgreSQL database.');
        usePostgres = true;
      }
    });
  } catch (err) {
    console.warn('⚠️  PostgreSQL initialization warning:', err.message);
    usePostgres = false;
  }
} else {
  console.log('ℹ️  No DATABASE_URL configured. Running with high-performance Bayern database store.');
}

export const db = {
  isPostgres() {
    return usePostgres;
  },

  async getAllPlayers(positionFilter) {
    if (usePostgres && pool) {
      try {
        const query = positionFilter 
          ? 'SELECT * FROM players WHERE position = $1'
          : 'SELECT * FROM players';
        const params = positionFilter ? [positionFilter] : [];
        const res = await pool.query(query, params);
        if (res.rows.length > 0) return res.rows;
      } catch (e) {
        console.warn('Postgres query error, using local dataset:', e.message);
      }
    }

    if (positionFilter) {
      return memoryStore.players.filter(p => isPositionEligible(p, positionFilter));
    }
    return memoryStore.players;
  },

  async getPlayerById(id) {
    if (usePostgres && pool) {
      try {
        const res = await pool.query('SELECT * FROM players WHERE id = $1', [id]);
        if (res.rows.length > 0) return res.rows[0];
      } catch (e) {
        // fallback
      }
    }
    return memoryStore.players.find(p => p.id === id) || null;
  },

  async createDraft(draftId, formation = '4-3-3') {
    const draft = {
      id: draftId,
      created_at: new Date(),
      status: 'playing',
      current_round: 1,
      formation: formation || '4-3-3',
      userTeam: [],
      opponentTeam: [],
      usedPlayerIds: []
    };

    if (usePostgres && pool) {
      try {
        await pool.query(
          'INSERT INTO drafts (id, status, current_round, formation) VALUES ($1, $2, $3, $4)',
          [draft.id, draft.status, draft.current_round, draft.formation]
        );
      } catch (e) {
        console.warn('Postgres draft insert error:', e.message);
      }
    }

    memoryStore.drafts.set(draftId, draft);
    memoryStore.picks.set(draftId, []);
    return draft;
  },

  async getDraft(draftId) {
    if (memoryStore.drafts.has(draftId)) {
      return memoryStore.drafts.get(draftId);
    }

    if (usePostgres && pool) {
      try {
        const res = await pool.query('SELECT * FROM drafts WHERE id = $1', [draftId]);
        if (res.rows.length > 0) {
          const draft = res.rows[0];
          // load picks
          const picksRes = await pool.query('SELECT * FROM draft_picks WHERE draft_id = $1 ORDER BY round_number', [draftId]);
          draft.picks = picksRes.rows;
          return draft;
        }
      } catch (e) {
        // fallback
      }
    }
    return null;
  },

  async savePick(draftId, roundNumber, userPlayer, opponentPlayer, wasMystery) {
    const draft = memoryStore.drafts.get(draftId);
    if (draft) {
      draft.userTeam.push(userPlayer);
      draft.opponentTeam.push(opponentPlayer);
      draft.usedPlayerIds.push(userPlayer.id, opponentPlayer.id);
      draft.current_round = roundNumber + 1;
      if (draft.current_round > 11) {
        draft.status = 'completed';
      }
    }

    if (usePostgres && pool) {
      try {
        await pool.query(
          'INSERT INTO draft_picks (draft_id, player_id, round_number, team, position, was_mystery) VALUES ($1, $2, $3, $4, $5, $6)',
          [draftId, userPlayer.id, roundNumber, 'user', userPlayer.position, wasMystery]
        );
        await pool.query(
          'INSERT INTO draft_picks (draft_id, player_id, round_number, team, position, was_mystery) VALUES ($1, $2, $3, $4, $5, $6)',
          [draftId, opponentPlayer.id, roundNumber, 'opponent', opponentPlayer.position, !wasMystery]
        );
        await pool.query(
          'UPDATE drafts SET current_round = $1, status = $2 WHERE id = $3',
          [draft.current_round, draft.status, draftId]
        );
      } catch (e) {
        console.warn('Postgres pick save error:', e.message);
      }
    }

    return draft;
  }
};
