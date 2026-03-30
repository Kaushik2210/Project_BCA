import { Worker } from "bullmq";
import { sendEmail } from "./emailClient.js";

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
        url:process.env.REDIS_URL
    },
    concurrency:5,
    limiter:{
        max:10,
        duration:5000
    }
})