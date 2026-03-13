import zod from "zod";

export const bookAppointmentSchema=zod.object({
    slotId:zod.string().min(1,"Select a slot"),
    name:zod.string().min(1,"Name is required"),
    email:zod.email().min(1,"Email is required"),
    phone:zod.string().min(1,"Phone number is required"),
    appointmentMode:zod.enum(['in-person','virtual'],{message:"Select appointment mode"}),
    message:zod.string().optional()
})
