import express from 'express';
import { sermonsRouter } from "./routes/sermon.route.js";
import { scheduleRouter } from "./routes/schedule.router.js";
import { authRouter } from "./routes/auth.route.js";
import { choirRouter } from "./routes/choir.route.js";
import { contactRouter } from "./routes/contact.route.js";
import { prayerRouter } from "./routes/prayer.route.js";
import { ApiResponse } from "./utils/apiResponse.js";
import { blogRouter } from "./routes/blog.route.js";
import { newsletterRouter } from "./routes/newsletter.route.js";
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
app.use("/api/v1/schedule", scheduleRouter);
app.use("/api/v1/choir", choirRouter);
app.use("/api/v1/contact", contactRouter);
app.use("/api/v1/prayers",prayerRouter);
app.use("/api/v1/blogs",blogRouter);
app.use("/api/v1/newsletter",newsletterRouter);


export default app;