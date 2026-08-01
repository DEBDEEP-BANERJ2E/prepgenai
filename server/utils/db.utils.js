import mongoose from "mongoose";

export const connectDB = async ()=>{

    try{
        if (process.env.MONGODB_URI) {
            await mongoose.connect(process.env.MONGODB_URI)
            console.log("DB sucessfully connected")
        } else {
            console.log("WARNING: MONGODB_URI is not set. Running without a database connection.");
        }
    }catch (error){
        console.log("DB error: " + error.message)
        // process.exit()
    }

}