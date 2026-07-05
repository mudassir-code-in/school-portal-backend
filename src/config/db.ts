import mongoose from 'mongoose';


export async function connectDB(): Promise<void>{
    try {
        
        await mongoose.connect(process.env.MONGO_URI!);
        console.log('DB was connected');
        
    } catch (error) {

        console.log('mongo connection error', error);
        process.exit(1);

    }
}