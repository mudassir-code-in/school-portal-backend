import mongoose, { Schema, model } from "mongoose";


interface ISubject {
    subjectName: string;
    obtainedMarks: number;
    maxMarks: number;
}


interface IResult {
    rollNumber: number;
    className: number;  
    studentName: string;
    fatherName: string;
    motherName: string;
    subjects: ISubject[]; 
    totalMarks: number;
    totalMaxMarks: number;
    percentage: number;
    year: string;
    status: 'Pass' | 'Fail' | 'Compartment' | string; 
    grade: string;
}


const resultSchema = new Schema<IResult>({
    rollNumber: {
        type: Number,
        required: [true, 'Roll number is required'],
        index: true
    },
    className: {
        type: Number,
        required: [true, 'Class is required'],
        index: true
    },
    studentName: {
        type: String,
        required: [true, 'Student name is required'],
        index: true
    },
    fatherName: {
        type: String,
        required: [true, 'Father name is required']
    },
    motherName: {
        type: String,
        required: [true, 'Mother name is required']
    },
    subjects: [
        {
            subjectName: { type: String, required: [true, 'Subject name is required'] },
            obtainedMarks: { type: Number, required: [true, 'obtained mark is required'] },
            maxMarks: { type: Number, default: 100 }
        }
    ],
    totalMarks: { type: Number, default: 0 },
    totalMaxMarks: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 },
    year: { type: String, required: true, index: true },
    status: {
        type: String,
        required: [true, 'Status is required']
    },
    grade: {
        type: String,
        required: [true, 'Grade is required']
    }
}, { timestamps: true });


export const resultModel = model<IResult>('Result', resultSchema);