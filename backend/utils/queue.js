// Import the Queue class from BullMQ — a powerful job queue library built on Redis.
// BullMQ allows us to process tasks asynchronously in the background (e.g., sending emails).
import { Queue } from "bullmq";

const notificationQueue=new Queue("notificationQueue",{
    connection:{
        url:process.env.REDIS_URL,
        // tls:{
        //     rejectUnauthorized:false
        // }
    }
})

const appointmentQueue=new Queue("appointmentQueue",{
    connection:{
        url:process.env.REDIS_URL,
        // tls:{
        //     rejectUnauthorized:false
        // }
    }
})


export {notificationQueue, appointmentQueue};

