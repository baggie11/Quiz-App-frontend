import express from 'express';
import { joinSessionController } from '../controller/participants.controller.js';

const router = express.Router({ mergeParams: true });



router.post("/join-session", joinSessionController);

export default router;