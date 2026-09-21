import { playerService } from '../services/playerService.js';

export const playerController = {
  async getAllPlayers(req, res, next) {
    try {
      const { position } = req.query;
      const players = await playerService.getAllPlayers(position);
      res.json({ success: true, count: players.length, data: players });
    } catch (err) {
      next(err);
    }
  },

  async getPlayerById(req, res, next) {
    try {
      const { id } = req.params;
      const player = await playerService.getPlayerById(id);
      if (!player) {
        return res.status(404).json({ success: false, error: 'Player not found' });
      }
      res.json({ success: true, data: player });
    } catch (err) {
      next(err);
    }
  }
};
