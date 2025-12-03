import express from 'express';
import { joinSessionController } from '../controller/session.controller.js';
import { sessionStatusController } from '../controller/session.controller.js';
import questionRoutes from './routes/question.routes.js';

// Mount under sessions
// e.g., POST /api/sessions/:sessionId/questions


const router = express.Router();

router.post('/join',joinSessionController);
router.get('/:sessionId/status',sessionStatusController);
router.post('/:sessionId/questions', questionRoutes);

export default router;