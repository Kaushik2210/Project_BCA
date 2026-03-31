import {Queue} from "bullmq";

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

