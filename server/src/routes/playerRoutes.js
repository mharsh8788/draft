import express from 'express';
import { playerController } from '../controllers/playerController.js';

const router = express.Router();

router.get('/', playerController.getAllPlayers);
router.get('/:id', playerController.getPlayerById);

export default router;
