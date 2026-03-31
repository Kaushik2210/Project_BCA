// Import the Express framework — the core web server library for Node.js.
import express from 'express';

// ---- Import all route modules ----
// Each router handles a specific group of API endpoints.
import { sermonsRouter } from "./routes/sermon.route.js";
import { authRouter } from "./routes/auth.route.js";
import { choirRouter } from "./routes/choir.route.js";
import { contactRouter } from "./routes/contact.route.js";
import { prayerRouter } from "./routes/prayer.route.js";
import { ApiResponse } from "./utils/apiResponse.js";
import { blogRouter } from "./routes/blog.route.js";
import { newsletterRouter } from "./routes/newsletter.route.js";
import { appointmentRouter } from "./routes/appointment.route.js";
import { scheduleRouter } from "./routes/schedule.route.js";
import { slotRouter } from "./routes/slot.route.js";
import { adminRouter } from "./routes/admin.route.js";
import { Worker } from "bullmq";
import {sendEmail,sendAppointmentEmail} from "./utils/emailClient.js";

// Import BullMQ Worker class to process background email jobs from the Redis queue.
import { Worker } from "bullmq";
// Import the email sending utility function.
import { sendEmail } from "./utils/emailClient.js";

// Import CORS middleware — allows the frontend (on a different port/domain) to make API requests to this backend.
import cors from 'cors';

// Create the Express application instance.
const app = express();

// ---- GLOBAL MIDDLEWARE ----

// Enable CORS (Cross-Origin Resource Sharing) for all origins.
// Without this, browsers would block requests from the frontend (localhost:5173) to the backend (localhost:8000).
app.use(cors());

// Parse URL-encoded form data (e.g., from HTML forms). `extended: true` allows nested objects.
app.use(express.urlencoded({ extended: true }));

// Parse incoming JSON request bodies. Makes `req.body` available as a JavaScript object.
app.use(express.json());

// ---- SELF-PING MECHANISM ----
// On free hosting platforms (like Render), servers go to sleep after 15 minutes of inactivity.
// This interval sends a request to our own /ping endpoint every 14 minutes to prevent downtime.
setInterval(() => {
    fetch(process.env.BACKEND_URL + '/ping')
    console.log('Self-ping sent to prevent downtime');
}, 840000); // 840,000 ms = 14 minutes

// ---- BACKGROUND EMAIL WORKER ----
// BullMQ Worker that processes email notification jobs from the Redis queue.
// `global.workerInitialized` prevents creating duplicate workers if the module is imported multiple times.
if(!global.workerInitialized){
    global.workerInitialized = true;

    // Create a new Worker that listens to the "notificationQueue" queue.
    // When a job arrives, the worker extracts the email data and calls `sendEmail()`.
    const worker = new Worker("notificationQueue", async (job) => {
        // Destructure the job data (set by the blog controller when publishing a blog).
        const { email, subject, excerpt, title } = job.data;
        // Call the Mailgun email utility to actually send the email.
        await sendEmail({
            to: email,
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
        concurrency: 2,   // Process up to 2 emails simultaneously
        limiter: {
            max: 10,       // Maximum 10 jobs...
            duration: 5000  // ...per 5 seconds (prevents overwhelming the email API)
        }
    })
}

// ---- HEALTH CHECK ENDPOINT ----
// Simple ping route to verify the server is alive.
app.get('/ping', (req, res) => {
    return res.status(200).json(new ApiResponse(200, null, "Ping successful"));
})

// ---- MOUNT ALL API ROUTERS ----
// Each `app.use()` mounts a router at a specific URL prefix.
// For example, `authRouter` handles all requests starting with `/api/v1/auth`.
app.use("/api/v1/auth", authRouter);           // Login endpoint
app.use("/api/v1/sermons", sermonsRouter);     // Sermon CRUD endpoints
app.use("/api/v1/schedule", scheduleRouter);   // Schedule CRUD endpoints
app.use("/api/v1/choir", choirRouter);         // Choir event endpoints
app.use("/api/v1/contact", contactRouter);     // Contact form endpoints
app.use("/api/v1/prayers", prayerRouter);      // Prayer request endpoints
app.use("/api/v1/blogs", blogRouter);          // Blog CRUD endpoints
app.use("/api/v1/newsletter", newsletterRouter); // Newsletter subscription endpoints
app.use("/api/v1/appointments", appointmentRouter); // Appointment booking endpoints
app.use("/api/v1/slots", slotRouter);          // Time slot management endpoints
app.use("/api/v1/admin", adminRouter);         // Admin user management endpoints

// Export the configured Express app (imported by index.js to start the server).
export default app;