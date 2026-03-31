// Import Zod.
import zod from "zod";

// Zod validation schema for prayer request submissions.
export const prayerSchema = zod.object({
    name: zod.string().min(1, "Name is required"),              // Requester's name, must be non-empty
    description: zod.string().min(1, "Description is required"),// Prayer description, must be non-empty
    prayed: zod.boolean().optional()                             // Optional boolean, admin sets this later
})