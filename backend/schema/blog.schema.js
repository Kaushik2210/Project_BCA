import zod from "zod";

export const blogSchema=zod.object({
    title:zod.string().min(1,"Title is required"),
    content:zod.string().min(1,"Content is required")
})