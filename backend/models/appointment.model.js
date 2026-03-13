import { model,Schema } from "mongoose";

const appointmentSchema=new Schema({
    slotId:{
        type:Schema.Types.ObjectId,
        ref:'Slot',
        required:true
    },
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    phone:{
        type:String,
        required:true
    },
    appointmentMode:{
        type:String,
        enum:['in-person','virtual'],
        required:true
    },
    message:{
        type:String,
        default:""
    },
    status:{
        type:String,
        enum:['pending','confirmed','cancelled'],
        default:'pending'
    },
})
appointmentSchema.index({slotId:1,email:1},{unique:true})

const Appointment=model('Appointment',appointmentSchema);
export {Appointment};