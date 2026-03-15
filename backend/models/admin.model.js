import {model,Schema} from "mongoose";
import bcrypt from "bcrypt";

const adminSchema=new Schema({
    username:{
        type:String,
        required:true,
        unique:true,
    },
    password:{
        type:String,
        required:true
    }
})

adminSchema.pre('save',async function(){
    if(!this.isModified("password")) return next();

    try {
        this.password=await bcrypt.hash(this.password,10);
    } catch (error) {
        throw error
    }
})

adminSchema.methods.comparePassword=async function(password){
    return await bcrypt.compare(password,this.password);
}

const Admin=new model('Admin',adminSchema);
export {Admin}