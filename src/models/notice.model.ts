import mongoose, { Schema, model } from "mongoose";


interface INotice {
    avatar?: string;   
    imageUrl?: string; 
    message: string;    
}


const noticeSchema = new Schema<INotice>({
    avatar: {
        type: String,
    },
    imageUrl: {
        type: String,
    },
    message: {
        type: String,
        required: [true, 'Message is required'] 
    }
}, { timestamps: true });


export const noticeModel = model<INotice>('Notice', noticeSchema);