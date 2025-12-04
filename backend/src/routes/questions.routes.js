import express from 'express';
import { addQuestionsController, listQuestionsController } from '../controller/questions.controller.js';


const router = express.Router({ mergeParams: true });

// POST /sessions/:sessionId/questions → Add question
router.post('/', addQuestionsController);

// GET /sessions/:sessionId/questions → List questions
router.get('/', listQuestionsController);

export default router;
