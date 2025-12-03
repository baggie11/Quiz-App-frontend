import express from 'express';
import { userSignUp,userLogin } from '../auth/auth.controller';

const router = express.Router();

//routes
router.post('/user/signup', userSignUp);
router.post('/user/login',userLogin);

export default router;