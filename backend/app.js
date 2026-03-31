import express from 'express';
import { sermonsRouter } from "./routes/sermon.route.js";
import { authRouter } from "./routes/auth.route.js";
import { choirRouter } from "./routes/choir.route.js";
import { contactRouter } from "./routes/contact.route.js";
import { prayerRouter } from "./routes/prayer.route.js";
import { ApiResponse } from "./utils/apiResponse.js";
import { blogRouter } from "./routes/blog.route.js";
import { newsletterRouter } from "./routes/newsletter.route.js";
import {appointmentRouter} from "./routes/appointment.route.js"
import { scheduleRouter } from "./routes/schedule.route.js";
import { slotRouter } from "./routes/slot.route.js";
import { adminRouter } from "./routes/admin.route.js";
import { Worker } from "bullmq";
import {sendEmail,sendAppointmentEmail} from "./utils/emailClient.js";

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

// Worker to process email notifications from the queue
if(!global.workerInitialized){
    global.workerInitialized=true;
    const worker=new Worker("notificationQueue",async(job)=>{
        const {email,subject,excerpt,title}=job.data;
        await sendEmail({
            to:email,
            subject,
            excerpt,
            title
        })
    },{
        connection:{
            url:process.env.REDIS_URL,
            // tls:{
            //     rejectUnauthorized:false
            // }
        },
        concurrency:2,
        limiter:{
            max:10,
            duration:5000
        }
    })

    const workerAppointment=new Worker("appointmentQueue",async(job)=>{
        const {email,subject,meetLink,name,date,startTime}=job.data;
        await sendAppointmentEmail({
            to:email,
            subject,
            meetLink,
            name,
            date,
            startTime
        })
    },{
        connection:{
            url:process.env.REDIS_URL,
            // tls:{
            //     rejectUnauthorized:false
            // }
        },
        concurrency:2,
        limiter:{
            max:10,
            duration:5000
        }
    })
}


app.get('/ping',(req,res)=>{
    return res.status(200).json(new ApiResponse(200,null,"Ping successful"));
})

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/sermons",sermonsRouter);
app.use("/api/v1/schedule", scheduleRouter);
app.use("/api/v1/choir", choirRouter);
app.use("/api/v1/contact", contactRouter);
app.use("/api/v1/prayers",prayerRouter);
app.use("/api/v1/blogs",blogRouter);
app.use("/api/v1/newsletter",newsletterRouter);
app.use("/api/v1/appointments",appointmentRouter);
app.use("/api/v1/slots", slotRouter);
app.use("/api/v1/admin",adminRouter);


export default app;