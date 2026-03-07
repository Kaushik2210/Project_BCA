import {Schema,model} from "mongoose";

const ContactSchema=new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    replied:{
        type:Boolean,
        default:false
    }
});

const Contact=model("Contact",ContactSchema);
export {Contact};

