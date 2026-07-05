import jwt from 'jsonwebtoken';
import type { Request, Response } from 'express';
import redisClient from '../config/redis.js';

export async function verifyAccessToken(req: Request, res: Response, next: any) {
    try {

        const accessToken = req.cookies.accessToken;


        if (!accessToken) {
            return res.status(401).json({
                success: false,
                message: 'token not found'
            })
        }

        let decoded: any;

        try {
            decoded = jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET!);
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token or expire token'
            })
        }

        const sessionExists = await redisClient.get(`session:${decoded.user}:${decoded.sessionId}`);

        if (!sessionExists) {

            res.clearCookie('refreshToken', { httpOnly: true, secure: true, sameSite: 'none' });
            res.clearCookie('accessToken', { httpOnly: true, secure: true, sameSite: 'none' });

            return res.status(401).json({ success: false, message: 'Session revoked. Please login again.' });
        }

        (req as any).user = decoded;

        next();

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        })
    }
};


export function verifyIsAdmin(req: Request, res: Response, next: any) {
    try {

        const user = (req as any).user;

        if(!user){
            return res.status(401).json({
                success: false,
                message: 'Unauthorized: Login first'
            })
        }

        if(user.role !== 'admin'){
            return res.status(403).json({
                success: false,
                message: 'Only the admin can perform these actions.'
            })
        }

        next();
        
    } catch (error: any) { 
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        })
        
    }
}

export function verifyIsTeacherOrAdmin(req: Request, res: Response, next: any) {
    try {

        const user = (req as any).user;

        if(!user){
            return res.status(401).json({
                success: false,
                message: 'Unauthorized: Login first'
            })
        }

        if(user.role !== 'teacher' && user.role !== 'admin'){
            return res.status(403).json({
                success: false,
                message: 'Only the admin can perform these actions.'
            })
        }

        next();
        
    } catch (error: any) { 
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        })
        
    }
}