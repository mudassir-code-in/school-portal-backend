import express from 'express';
import { verifyAccessToken, verifyIsAdmin } from '../middlewares/auth.middleware.js';
import { allPeople, allTeachers, deleteNotice, deleteTeacher, getComplaints, submitNotice, updateToTeacher } from '../controllers/admin.controller.js';
import multer from 'multer';


export const adminRouter = express.Router();

const upload = multer({storage: multer.memoryStorage()});


adminRouter.post('/add-teacher', verifyAccessToken, verifyIsAdmin, updateToTeacher);

adminRouter.post('/delete-teacher', verifyAccessToken, verifyIsAdmin, deleteTeacher);

adminRouter.get('/get-teachers', verifyAccessToken, verifyIsAdmin, allTeachers);

adminRouter.get('/all-people', verifyAccessToken, verifyIsAdmin, allPeople);

adminRouter.get('/get-complaints', verifyAccessToken, verifyIsAdmin, getComplaints);

adminRouter.post('/submit-notice', verifyAccessToken, verifyIsAdmin, upload.single('image'), submitNotice);

adminRouter.post('/delete-notice', verifyAccessToken, verifyIsAdmin, deleteNotice);

