import express from 'express';
import { sermonsRouter } from "./routes/sermon.router.js";
//import { scheduleRouter } from "./routes/schedule.router.js";
import { authRouter } from "./routes/auth.router.js";
import { choirRouter } from "./routes/choir.router.js";
import { contactRouter } from "./routes/contact.router.js";
import cors from 'cors';



const app=express();

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/api/v1/sermons",sermonsRouter);
app.use("/api/v1/auth", authRouter);
//app.use("/api/v1/schedule", scheduleRouter);
app.use("/api/v1/choir", choirRouter);
app.use("/api/v1/contact", contactRouter);

export default app;