import { draftService } from '../services/draftService.js';

export const draftController = {
  async createDraft(req, res, next) {
    try {
      const { formation } = req.body || {};
      const draft = await draftService.createDraft(formation);
      res.status(201).json({ success: true, data: draft });
    } catch (err) {
      next(err);
    }
  },

  async getDraft(req, res, next) {
    try {
      const { id } = req.params;
      const draft = await draftService.getDraft(id);
      if (!draft) {
        return res.status(404).json({ success: false, error: 'Draft not found' });
      }
      res.json({ success: true, data: draft });
    } catch (err) {
      next(err);
    }
  },

  async choose(req, res, next) {
    try {
      const { id } = req.params;
      const { choice, revealedPlayerId, mysteryPlayerId } = req.body;

      if (!choice || !['revealed', 'mystery'].includes(choice)) {
        return res.status(400).json({ 
          success: false, 
          error: "Invalid selection. Choice must be 'revealed' or 'mystery'" 
        });
      }

      if (!revealedPlayerId || !mysteryPlayerId) {
        return res.status(400).json({ 
          success: false, 
          error: "Both revealedPlayerId and mysteryPlayerId must be provided" 
        });
      }

      const result = await draftService.makeChoice(id, choice, { revealedPlayerId, mysteryPlayerId });
      res.json({ success: true, data: result });
    } catch (err) {
      if (err.message.includes('not found')) {
        return res.status(404).json({ success: false, error: err.message });
      }
      if (err.message.includes('already') || err.message.includes('not match') || err.message.includes('Invalid')) {
        return res.status(400).json({ success: false, error: err.message });
      }
      next(err);
    }
  },

  async finish(req, res, next) {
    try {
      const { id } = req.params;
      const summary = await draftService.finishDraft(id);
      res.json({ success: true, data: summary });
    } catch (err) {
      next(err);
    }
  }
};
