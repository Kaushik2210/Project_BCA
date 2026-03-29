import jwt from 'jsonwebtoken';
import { asyncHandler } from "../utils/asyncHandler.js";
import { Admin } from "../models/admin.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";


// JWT-based auth. 
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;

export const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  const adminUser = process.env.ADMIN_USER;
  const adminPass = process.env.ADMIN_PASSWORD;
 
  if (!username || !password) {
    return res.status(400).json(new ApiError(400,"Username and password is required").toJSON());
  }

  //check if it is super-admin
  if(username==adminUser && password==adminPass){
    const payload = { username,role:'super-admin' };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    const expires = Date.now() + 1000 * 60 * 60; 
    return res.status(200).json(new ApiResponse(200,{ token, expires },"Logged in successfully"));
  }

  //check if normal admin
  const admin=await Admin.findOne({username});

  if(!admin){
    return res.status(404).json(new ApiError(404,"username or password is wrong").toJSON());
  }

  const isMatch=await admin.comparePassword(password);
  
  if(isMatch){
    const payload = { username,role:'admin' };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    const expires = Date.now() + 1000 * 60 * 60; 
    return res.status(200).json(new ApiResponse(200,{ token, expires },"Logged in successfully"));
  }else{
    return res.status(404).json(new ApiError(404,"username or password is wrong").toJSON());
  }

});

export const verifyToken = (token) => {
  try {
    if (!token) return null;
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (err) {
    return null;
  }
};

export default { login, verifyToken };
