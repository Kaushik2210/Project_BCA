// Import the Zod validation library for runtime data validation.
import zod from "zod";

// Define a Zod validation schema for booking appointments.
// Zod validates data shape and types at runtime (unlike TypeScript which only checks at compile time).
export const bookAppointmentSchema = zod.object({
    slotId: zod.string().min(1, "Select a slot"),                        // Must be a non-empty string
    name: zod.string().min(1, "Name is required"),                       // Name is required
    email: zod.email().min(1, "Email is required"),                      // Must be valid email format
    phone: zod.string().min(1, "Phone number is required"),              // Phone number is required
    appointmentMode: zod.enum(['in-person', 'virtual'], { message: "Select appointment mode" }),  // Must be one of these two values
    message: zod.string().optional()                                      // Message is optional
})
