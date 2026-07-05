import {Schema, model} from "mongoose";



interface IUser  {
    name: string;
    email: string;
    avatar?: string;
    role: 'student' | 'teacher' | 'admin';
}


const userSchema = new Schema<IUser>({
    name: {
        type: String,
        required: [true, 'name is required'],
    },
    email: {
        type: String,
        unique: true,
        required: [true, 'email is required']
    },
    avatar: {
        type: String,
    },
    role: {
        type: String,
        required: [true, 'role is required'],
        enum: ['student', 'teacher', 'admin'],
        default: 'student'
    }
    
}, {timestamps: true});


export const userModel = model<IUser>('Users', userSchema);