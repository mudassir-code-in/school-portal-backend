import express from 'express';
import { checkMe, login, logout, refreshToken } from '../controllers/auth.controller.js';
import { verifyAccessToken } from '../middlewares/auth.middleware.js';



export const authRouter = express.Router();

authRouter.post('/login', login);


authRouter.get('/me', verifyAccessToken, checkMe);

authRouter.get('/refresh-token', refreshToken);

authRouter.get('/logout', verifyAccessToken, logout);





