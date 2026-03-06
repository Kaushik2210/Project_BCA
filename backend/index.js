import app from "./app.js";
import dotenv from 'dotenv';
import { connecttoDB } from "./config/database.js";
dotenv.config();

const PORT=process.env.PORT;


connecttoDB().then(()=>{
    app.listen(PORT,()=>{
         console.log(`The server is running on localhost:${PORT}`)
    })
})