import {Schema} from "mongoose";

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
    }
});

const Contact=mongoose.model("Contact",ContactSchema);
export {Contact};

