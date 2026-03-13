import zod from "zod";

export const prayerSchema=zod.object({
    name:zod.string().min(1,"Name is required"),
    description:zod.string().min(1,"Description is required"),
    prayed:zod.boolean().optional()
})