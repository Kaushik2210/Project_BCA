import express from 'express';
import dotenv from 'dotenv';
import { connecttoDB } from "./config/database.js";
import { sermonsRouter } from "./routes/sermon.router.js";
import { authRouter } from "./routes/auth.router.js";
import cors from 'cors';


dotenv.config();

const PORT=process.env.PORT;
const app=express();

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/api/v1/sermons",sermonsRouter);
app.use("/api/v1/auth", authRouter);

connecttoDB().then(
    ()=>{
        const server=app.listen(PORT,()=>{
            console.log(`The server is running on localhost:${PORT}`)
        })
    })