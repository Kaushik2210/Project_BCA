import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Admin } from "../models/admin.model.js";

const createAdmin=asyncHandler(async(req,res)=>{
    const {username,password}=req.body;

    if(!username || !password){
        return res.status(400).json(new ApiError(400,"Username and password is required").toJSON());
    }

    const existedAdmin = await Admin.findOne({ username });
    if (existedAdmin) {
        return res.status(409).json(new ApiError(409, "Admin with this username already exists").toJSON());
    }

    const admin=await Admin.create({
        username,
        password
    })

    if(!admin){
        return res.status(404).json(new ApiError(404,"Error creating admin").toJSON());
    }

    return res.status(200).json(new ApiResponse(200,"Admin User created successfully"));
})

const getAdmin=asyncHandler(async(req,res)=>{
    const admin=await Admin.find().select("-password");
    return res.status(200).json(new ApiResponse(200,admin,"Admins fetched successfully"));
})

const updateAdmin=asyncHandler(async(req,res)=>{
    const {password:newPassword,id}=req.body;

    if( !newPassword || !id){
        return res.status(400).json(new ApiError(400,"All fields are required").toJSON());
    }

    const admin=await Admin.findById(id);

    if(!admin){
        return res.status(404).json(new ApiError(404,"Admin not found").toJSON());
    }

    
    admin.password=newPassword;
    await admin.save();

    return res.status(200).json(new ApiResponse(200,null,"Password updated successfully"));
})

const deleteAdmin=asyncHandler(async(req,res)=>{
    const {id}=req.body;

    if(!id){
        return res.status(400).json(new ApiError(400,"Admin ID is required").toJSON());
    }

    const admin=await Admin.findByIdAndDelete(id);

    if(!admin){
        return res.status(404).json(new ApiError(404,"Admin not found").toJSON());
    }

    return res.status(200).json(new ApiResponse(200,"Admin deleted successfully"));
})

export {createAdmin,getAdmin,updateAdmin,deleteAdmin};