import express from 'express';
import { verifyAccessToken } from '../middlewares/auth.middleware.js';
import { complaint, getNotice } from '../controllers/student.controller.js';



export const studentRouter = express.Router();


studentRouter.post('/submit-complaint', verifyAccessToken, complaint);

studentRouter.get('/get-notice', verifyAccessToken, getNotice);