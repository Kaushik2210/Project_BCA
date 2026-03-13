import {Schema,model} from "mongoose";
import { boolean } from "zod";

const prayerSchema=new Schema({
    name:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true,

    },
    prayed:{
        type:Boolean,
        required:false,
        default:false
    }
},{timestamps:true})

const Prayer=model("Prayer",prayerSchema)
export default Prayer