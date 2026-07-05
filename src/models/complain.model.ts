import { Schema, model } from "mongoose";

interface IComplaint {
    teacherName: string;
    className: number;
    complaint: string;
}

const complaintSchema = new Schema<IComplaint>({
    teacherName: {
        type: String,
        required: [true, 'Teacher name is required']
    },
    className: {
        type: Number,
        required: [true, 'Class name is required']
    },
    complaint: {
        type: String,
        required: [true, 'Complaint is required']
    }
}, { timestamps: true });

export const complaintModel = model<IComplaint>('Complaint', complaintSchema);