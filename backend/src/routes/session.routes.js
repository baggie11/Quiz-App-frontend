import express from 'express';
import { joinSessionController } from '../controller/session.controller.js';

const router = express.Router();

router.post('/join',joinSessionController);

export default router;