import mongoose from "mongoose";


export const connectDB = async () =>{

    try{
        const conn = await mongoose.connect(process.env.MONGO_URL);
        console.log(`Database connected ${conn.connection.host}`);
    }catch(error){
        console.log("error connecting with database", error);
        process.exit(1);
    }
}