import express from 'express';
import {
    addQuestionController,
    listQuestionsController
} from '../controllers/question.controller.js';

const router = express.Router({ mergeParams: true });

// POST /sessions/:sessionId/questions → Add question
router.post('/', addQuestionController);

// GET /sessions/:sessionId/questions → List questions
router.get('/', listQuestionsController);

export default router;
