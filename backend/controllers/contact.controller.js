import { Contact } from "../models/contact.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { contactSchema } from "../schema/contact.schema.js";
import omitFields from "../utils/omitFields.js";

const postContact=asyncHandler(async(req,res)=>{
    const {name,email,message}=req.body;
    const { error } = contactSchema.safeParse({ name, email, message });

    if (error) {
        return res.status(400).json(new ApiError(400, error.issues[0].message).toJSON());
    }
    let contact=await Contact.create({name,email,message});

    if(!contact){
        return res.status(500).json(new ApiError(500,"Failed to submit contact form").toJSON());
    }

    contact=omitFields(contact.toObject(),["__v","replied"]);

    return res.status(201).json(new ApiResponse(201,contact,"Contact form submitted successfully").toJSON());
})

const getContact=asyncHandler(async(req,res)=>{
    const contacts=await Contact.find().sort({createdAt:-1});

    return res.status(200).json(new ApiResponse(200,contacts,"Contacts fetched successfully").toJSON());
})

const markAsReplied=asyncHandler(async(req,res)=>{
    const contactId=req.params.id;
    const contact=await Contact.findById(contactId);

    if(!contact){
        return res.status(404).json(new ApiError(404,"Contact not found").toJSON());
    }
    contact.replied=true;
    await contact.save();
    return res.status(200).json(new ApiResponse(200,contact,"Contact marked as replied successfully").toJSON());
})

export {postContact,getContact,markAsReplied};