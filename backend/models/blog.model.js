import {Schema,model} from "mongoose";

const blogSchema=new Schema({
    title:{
        type:String,
        required:true
    },
    content:{
        type:String,
        required:true
    },
    slug:{
        type:String,
        required:true,
        unique:true
    },
},{timestamps:true})

const Blog = model("Blog", blogSchema);
export default Blog;