import type { Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import { userModel } from '../models/user.model.js';
import redisClient from '../config/redis.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';


const client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    'postmessage'
);

export async function login(req: Request, res: Response): Promise<any> {
    try {
        const { code } = req.body;

        if (!code) {
            return res.status(400).json({
                success: false,
                message: 'Authentication failed: Auth code is required'
            });
        }

        const { tokens } = await client.getToken(code);

        if (!tokens.id_token) {
            return res.status(400).json({
                success: false,
                message: 'Authentication failed: ID token is missing from Google.'
            });
        }

        const ticket = await client.verifyIdToken({
            idToken: tokens.id_token,
            audience: process.env.GOOGLE_CLIENT_ID as string,
        });

        const payload = ticket.getPayload();

        if (!payload) {
            return res.status(400).json({
                success: false,
                message: 'Authentication failed: Invalid token payload.'
            });
        }

        const { email, name, picture } = payload;

        const user = await userModel.findOne({ email });

        if (user) {


            const sessionData = {
                user: user._id,
                userAgent: req.headers['user-agent'],
                ip: req.ip
            }

            const sessionId = crypto.randomUUID();
            const redisKey: string = `session:${user._id}:${sessionId}`;


            await redisClient.set(redisKey, JSON.stringify(sessionData), {
                EX: 604800
            });

            const refreshToken = jwt.sign({
                user: user._id,
                role: user.role,
                sessionId: sessionId
            }, process.env.JWT_REFRESH_SECRET!, { expiresIn: '7d' });

            const accessToken = jwt.sign({
                user: user._id,
                role: user.role,
                sessionId: sessionId
            }, process.env.JWT_ACCESS_SECRET!, { expiresIn: '15m' });

            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: true,
                sameSite: 'none',
                maxAge: 7 * 24 * 60 * 60 * 1000
            })

            res.cookie('accessToken', accessToken, {
                httpOnly: true,
                secure: true,
                sameSite: 'none',
                maxAge: 15 * 60 * 1000
            })

            return res.status(200).json({
                success: true,
                message: 'User login successfully',
                user: {
                    name: user.name,
                    email: user.email,
                    avatar: user.avatar
                }
            })
        }


        const newUser = await userModel.create({
            name,
            email,
            avatar: picture
        })


        const sessionData = {
            user: newUser._id,
            userAgent: req.headers['user-agent'],
            ip: req.ip
        }

        const sessionId = crypto.randomUUID();
        const redisKey: string = `session:${newUser._id}:${sessionId}`;


        await redisClient.set(redisKey, JSON.stringify(sessionData), {
            EX: 604800
        });

        const refreshToken = jwt.sign({
            user: newUser._id,
            role: newUser.role,
            sessionId: sessionId
        }, process.env.JWT_REFRESH_SECRET!, { expiresIn: '7d' });

        const accessToken = jwt.sign({
            user: newUser._id,
            role: newUser.role,
            sessionId: sessionId
        }, process.env.JWT_ACCESS_SECRET!, { expiresIn: '15m' });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: 15 * 60 * 1000
        })

        return res.status(200).json({
            success: true,
            message: 'User verified successfully',
            user: {
                name: newUser.name,
                email: newUser.email,
                avatar: newUser.avatar
            }
        });

    } catch (error: any) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};


export async function checkMe(req: Request, res: Response): Promise<any> {
    try {


        const decoded = (req as any).user;

        const userId = decoded.user;

        const user = await userModel.findById(userId);

        if (!user) {
            return res.status(403).json({
                success: false,
                message: 'User not found'
            });
        }


        res.status(200).json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar
            }
        })


    } catch (error: any) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        })
    }
};


export async function refreshToken(req: Request, res: Response): Promise<any> {
    try {

        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            return res.status(401).json({
                success: false,
                message: 'token not found'
            });
        }


        let decoded: any;
        try {
            decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!);
        } catch (error: any) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token'
            })
        }

        const sessionData = await redisClient.get(`session:${decoded.user}:${decoded.sessionId}`);

        if (!sessionData) {
            return res.status(401).json({
                success: false,
                message: 'Session expired or logged out. Please login again.'
            })
        }

        interface UserSession {
            user: string;
            userAgent: string;
            ip: string;
        }

        const session = JSON.parse(sessionData) as UserSession;


        if (session.userAgent !== req.headers['user-agent']) {


            await redisClient.del(`session:${decoded.user}:${decoded.sessionId}`);

            res.clearCookie('accessToken');
            res.clearCookie('refreshToken');

            return res.status(401).json({
                success: false,
                message: 'Security Alert: Device mismatch detected! Session terminated.'
            });
        }


        await redisClient.set(`session:${decoded.user}:${decoded.sessionId}`, JSON.stringify(session), {
            EX: 604800
        });

        const newRefreshToken = jwt.sign({
            user: decoded.user,
            role: decoded.role,
            sessionId: decoded.sessionId
        }, process.env.JWT_REFRESH_SECRET!, { expiresIn: '7d' });


        const accessToken = jwt.sign({
            user: decoded.user,
            role: decoded.role,
            sessionId: decoded.sessionId
        }, process.env.JWT_ACCESS_SECRET!, { expiresIn: '15m' });



        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: 15 * 60 * 1000
        });

        res.status(200).json({
            success: true,
            message: 'accessToken generate successfully'
        });



    } catch (error: any) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        })
    }
};


export async function logout(req: Request, res: Response): Promise<any> {
    try {

        const decoded = (req as any).user;

        const redisKey = `session:${decoded.user}:${decoded.sessionId}`
    
        await redisClient.del(redisKey);


        res.clearCookie('refreshToken', { httpOnly: true, secure: true, sameSite: 'none' });
        res.clearCookie('accessToken', { httpOnly: true, secure: true, sameSite: 'none' });

        res.status(200).json({
            success: true,
            message: 'Logout successfully'
        })

        
    } catch (error: any) {
    console.error(error);
    return res.status(500).json({
        success: false,
        message: 'Internal server error'
    })
}};
