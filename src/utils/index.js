
import connectDB from "../DB/index.js";

import dotenv from "dotenv";
dotenv.config();



connectDB();


















/*
( async()=>{
    try{
        await mongoose.connect(`${process.env.MONGO_URL}/${DB_NAME}`);
        app.on("error", (err)=>{
            console.log("Some error occured while connecting to db", err);
        })
        app.listen(process.env.PORT, ()=>{
            console.log(`Server is running on port ${process.env.PORT}`);
        })

    }catch(err){
        console.log(err);
    }
})()
 */