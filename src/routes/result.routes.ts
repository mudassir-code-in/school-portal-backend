import express from 'express';
import { verifyAccessToken, verifyIsTeacherOrAdmin } from '../middlewares/auth.middleware.js';
import { createResult, deleteResult, viewAllResults, viewResult } from '../controllers/result.controller.js';


export const resultRouter = express.Router();


resultRouter.post('/create-result', verifyAccessToken, verifyIsTeacherOrAdmin, createResult );

resultRouter.get('/view-all-results',verifyAccessToken, verifyIsTeacherOrAdmin, viewAllResults);

resultRouter.post('/view-my-result', verifyAccessToken, viewResult);

resultRouter.post('/delete-result', verifyAccessToken, verifyIsTeacherOrAdmin, deleteResult);