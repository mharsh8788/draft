import express from 'express';
import { draftController } from '../controllers/draftController.js';

const router = express.Router();

router.post('/', draftController.createDraft);
router.get('/:id', draftController.getDraft);
router.post('/:id/choose', draftController.choose);
router.post('/:id/finish', draftController.finish);

export default router;
