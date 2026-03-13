import {Schema,model} from "mongoose";

const newsletterSchema=new Schema({
    email:{
        type:String,
        required:true,
        unique:true
    }
},{timestamps:true})

const Newsletter=model("Newsletter",newsletterSchema);
export {Newsletter};