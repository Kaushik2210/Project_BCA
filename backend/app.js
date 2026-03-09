import express from 'express';
import { sermonsRouter } from "./routes/sermon.router.js";
//import { scheduleRouter } from "./routes/schedule.router.js";
import { authRouter } from "./routes/auth.router.js";
import { choirRouter } from "./routes/choir.router.js";
import { contactRouter } from "./routes/contact.router.js";
import { ApiResponse } from "./utils/apiResponse.js";
import cors from 'cors';



const app=express();

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// self pinging to prevent downtime
setInterval(()=>{
    fetch(process.env.BACKEND_URL + '/ping')
    console.log('Self-ping sent to prevent downtime');
}, 840000); // 14 minutes



app.get('/ping',(req,res)=>{
    return res.status(200).json(new ApiResponse(200,null,"Ping successful").toJSON());
})

app.use("/api/v1/sermons",sermonsRouter);
app.use("/api/v1/auth", authRouter);
//app.use("/api/v1/schedule", scheduleRouter);
app.use("/api/v1/choir", choirRouter);
app.use("/api/v1/contact", contactRouter);

export default app;