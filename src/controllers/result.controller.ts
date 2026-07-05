import { resultModel } from "../models/result.model.js";
import type { Request,  Response } from "express";



export async function createResult(req: Request, res: Response): Promise<any> {
    try {
        const { rollNumber, className, name, subjects, year, fatherName, motherName } = req.body;

        // 🟢 FIXED: Validation check updated with fatherName and motherName error message
        if (!rollNumber || !className || !name || !subjects || !year || !Array.isArray(subjects) || !fatherName || !motherName) {
            return res.status(400).json({
                success: false,
                message: 'All fields (rollNumber, className, name, fatherName, motherName, subjects, year) are required!'
            });
        }

        let totalObtained = 0;
        let totalMax = 0;
        let isFailedInAnySubject = false;

        subjects.forEach((sub: any) => {
            const marks = Number(sub.obtainedMarks || 0);
            totalObtained += marks;
            totalMax += 100; 

            
            if (marks < 33) {
                isFailedInAnySubject = true;
            }
        });

        const finalPercentage = (totalObtained / totalMax) * 100;
        const roundedPercentage = Math.round(finalPercentage * 100) / 100;

        // 🎯 Pass / Fail Logic Decision
        let status = "Pass";
        if (roundedPercentage < 33 || isFailedInAnySubject) {
            status = "Fail";
        }

        // 📊 Grading System Logic
        let grade = "F";
        if (status !== "Fail") {
            if (roundedPercentage >= 85) grade = "A+";
            else if (roundedPercentage >= 75) grade = "A";
            else if (roundedPercentage >= 60) grade = "B";
            else if (roundedPercentage >= 45) grade = "C";
            else grade = "D";
        }

        // 💾 Creating result in database with all new fields
        const result = await resultModel.create({
            rollNumber,
            className,
            studentName: name,
            fatherName,      
            motherName,      
            year,
            subjects,
            totalMarks: totalObtained,
            totalMaxMarks: totalMax,
            percentage: roundedPercentage,
            status,          
            grade            
        });

        return res.status(201).json({
            success: true,
            message: "Result successfully created",
            data: result
        });

    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


export async function viewResult(req: Request, res: Response): Promise<any> {
    try {

        const { rollNumber, name, className, year } = req.body;

        if (!rollNumber || !name || !className || !year) {
            return res.status(400).json({
                success: false,
                message: 'Roll number, name, class name are required'
            })
        }

       const result = await resultModel.findOne({ 
            rollNumber: Number(rollNumber), 
            studentName: name,            
            className, 
            year 
        });

        if (!result) {
            return res.status(404).json({
                success: false,
                message: 'Result not found'
            })
        }

        res.status(200).json({
            success: true, 
            result
        })

    } catch (error: any) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        })
    }
}

export async function viewAllResults(req: Request, res: Response): Promise<any> {
    try {

        const results = await resultModel.find();

        res.status(200).json({
            success: true,
            results
        })

    } catch (error: any) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

export async function deleteResult(req: Request, res: Response): Promise<any>{
    try {

        const {studentName, className, rollNumber, year} = req.body;

        if(!studentName || !className || !rollNumber || !year){
            return res.status(400).json({
                success: false,
                message: 'Student name, Roll number, Year are required'
            });
        }

        const deleteResult = await resultModel.findOneAndDelete({rollNumber, className, studentName, year});

        if(!deleteResult){
            return res.status(404).json({
                success: false,
                message: 'Result not found'
            })
        }

        res.status(200).json({
            success: true,
            message: 'Result deleted successfully'
        });
        
    } catch (error: any) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        })
    }
}
