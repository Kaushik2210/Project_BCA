// Import the Queue class from BullMQ — a powerful job queue library built on Redis.
// BullMQ allows us to process tasks asynchronously in the background (e.g., sending emails).
import { Queue } from "bullmq";

// Create a new queue named "notificationQueue".
// This queue will hold email notification jobs that get processed by a Worker (defined in app.js).
const notificationQueue = new Queue("notificationQueue", {
    connection: {
        // The Redis connection URL is read from environment variables.
        // Redis is an in-memory data store that BullMQ uses to persist and manage job queues.
        url: process.env.REDIS_URL,
        tls: {
            // `rejectUnauthorized: false` allows connecting to Redis servers with self-signed SSL certificates.
            // Common when using hosted Redis services (e.g., Upstash, Railway).
            rejectUnauthorized: false
        }
    }
})

// Export the queue so controllers can add jobs to it (e.g., when a blog is published).
export { notificationQueue };
