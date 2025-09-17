import 'dotenv/config';
import connectDB from "./DB/index.js";
import app from "./app.js";

import dotenv from "dotenv";
dotenv.config({
    path: "./.env"
});





connectDB()
    .then(() => {
        app.listen(process.env.PORT || 3000, () => {
            console.log(`Server is running on port ${process.env.PORT}`);
        });
    })
    .catch((err) => {
        console.log("Error while connecting to DB", err);
    });

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
