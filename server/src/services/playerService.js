import { db } from '../db/database.js';

export const playerService = {
  async getAllPlayers(position) {
    return await db.getAllPlayers(position);
  },

  async getPlayerById(id) {
    return await db.getPlayerById(id);
  }
};
