// Client API service for Bayern Draft backend integration

const BASE_URL = '/api';

export const api = {
  async getHealth() {
    try {
      const res = await fetch(`${BASE_URL}/health`);
      return await res.json();
    } catch (err) {
      return null;
    }
  },

  async getAllPlayers(position) {
    try {
      const url = position ? `${BASE_URL}/players?position=${position}` : `${BASE_URL}/players`;
      const res = await fetch(url);
      const json = await res.json();
      return json.success ? json.data : null;
    } catch (err) {
      return null;
    }
  },

  async createDraft(formation = '4-3-3') {
    try {
      const res = await fetch(`${BASE_URL}/drafts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formation })
      });
      const json = await res.json();
      return json.success ? json.data : null;
    } catch (err) {
      return null;
    }
  },

  async choosePlayer(draftId, choice, revealedPlayerId, mysteryPlayerId) {
    try {
      const res = await fetch(`${BASE_URL}/drafts/${draftId}/choose`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ choice, revealedPlayerId, mysteryPlayerId })
      });
      const json = await res.json();
      return json.success ? json.data : null;
    } catch (err) {
      return null;
    }
  },

  async finishDraft(draftId) {
    try {
      const res = await fetch(`${BASE_URL}/drafts/${draftId}/finish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const json = await res.json();
      return json.success ? json.data : null;
    } catch (err) {
      return null;
    }
  }
};
