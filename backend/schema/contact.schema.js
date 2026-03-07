import zod from "zod";

export const contactSchema=zod.object({
    name:zod.string().min(1,"Name is required"),
    email:zod.email("Invalid email address"),
    message:zod.string().min(1,"Message is required")
})