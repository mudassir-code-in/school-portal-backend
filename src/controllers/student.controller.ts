import { complaintModel } from "../models/complain.model.js";
import type { Request, Response } from "express";
import { noticeModel } from "../models/notice.model.js";




export async function complaint(req: Request, res: Response): Promise<any>{
    try {

        const {teacherName, className, complaint} = req.body;

        if(!teacherName || !className || !complaint){
            return res.status(400).json({
                success: false,
                message: 'Teacher name, class name, complaint are required'
            });
        }
        
        const createComplaint = await complaintModel.create({
            teacherName,
            className,
            complaint
        })

        res.status(201).json({
            success: true,
            message: 'Complaint submit successfully',
            createComplaint
        })

    } catch (error: any) {
        console.error(error);
        return res.status(500).json({
            success: false, 
            message: 'Internal server error'
        })
    }
}; 

export async function getNotice(req: Request, res: Response): Promise<any>{
    try {

        const notice = await noticeModel.find();

        res.status(200).json({
            success: true,
            notice
        })
        
    } catch (error: any) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        })
    }
}