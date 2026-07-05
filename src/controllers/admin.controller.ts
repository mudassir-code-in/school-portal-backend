import { userModel } from "../models/user.model.js";
import type { Request, Response } from "express";
import redisClient from "../config/redis.js";
import { complaintModel } from "../models/complain.model.js";
import { noticeModel } from "../models/notice.model.js";
import { uploadToImagekit } from "../services/storage.service.js";



export async function updateToTeacher(req: Request, res: Response): Promise<any> {
    try {

        const { email, role } = req.body;

        if (!email || !role) {
            return res.status(400).json({
                success: false,
                message: 'Email or Role are required'
            });
        }


        const updatedUser = await userModel.findOneAndUpdate(
            { email },
            { $set: { role } },
            { returnDocument: 'after' }
        )

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: 'Teacher not found'
            })
        }

        const redisKey: string = `session:${updatedUser._id}:*`;


        const keys = await redisClient.keys(redisKey);


        if (keys.length > 0) {
            await redisClient.del(keys);
        }


        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Tacher add successfully.',
            updatedUser
        })


    } catch (error: any) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};


export async function deleteTeacher(req: Request, res: Response): Promise<any> {
    try {

        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            })
        }

        const deleteTeacher = await userModel.findOneAndUpdate(
            { email },
            { $set: { role: 'student' } },
            { returnDocument: 'after' }
        )

        if (!deleteTeacher) {
            return res.status(404).json({
                success: false,
                message: 'Teacher not found'
            })
        }

        const redisKey: string = `session:${deleteTeacher._id}:*`;


        const keys = await redisClient.keys(redisKey);


        if (keys.length > 0) {
            await redisClient.del(keys);
        }


        res.status(200).json({
            success: true,
            message: 'Teacher deleted successfully',
            deleteTeacher
        })


    } catch (error: any) {
        console.error(error);
        return res.status(500).json({
            success: false, message: 'Internal server error'
        })
    }
};


export async function allTeachers(req: Request, res: Response): Promise<any> {
    try {



        const teachers = await userModel.find({ role: 'teacher' });

        if (!teachers) {
            return res.status(404).json({
                success: false,
                message: 'Teachers not found'
            })
        }

        res.status(200).json({
            success: true,
            teachers
        })


    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        })
    }
};


export async function allPeople(req: Request, res: Response): Promise<any> {
    try {

        const users = await userModel.find();


        if (!users) {
            return res.status(404).json({
                success: false,
                message: 'Users not found'
            })
        }

        res.status(200).json({
            success: true,
            users
        })

    } catch (error: any) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        })
    }
};


export async function getComplaints(req: Request, res: Response): Promise<any> {
    try {

        const complaint = await complaintModel.find();


        res.status(200).json({
            success: true,
            complaint
        })


    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        })
    }
}


export async function submitNotice(req: Request, res: Response): Promise<any> {
    try {

        const { avatar, message } = req.body;


        let imageData = null;


        if (req.file && req.file.buffer) {
            try {
                imageData = await uploadToImagekit((req as any).file.buffer);
            } catch (error) {
                console.error("Image upload failed:", error);

            }
        }


        const notice = await noticeModel.create({
            avatar,
            imageUrl: imageData?.url,
            message
        });

        res.status(200).json({
            success: true,
            message: 'Notice Add Successfully',
            notice
        });


    } catch (error: any) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        })
    }
};

export async function deleteNotice(req: Request, res: Response): Promise<any> {
    try {

        const { noticeId } = req.body;

        await noticeModel.findByIdAndDelete(noticeId);

        res.status(200).json({
            success: true,
            message: 'Notice Deleted Successfully'
        })

    } catch (error: any) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        })
    }
};



