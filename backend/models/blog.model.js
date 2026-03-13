import {Schema,model} from "mongoose";

const blogSchema = new Schema({
    title:{
        type: String,
        required: true 
    },
    content:{ 
        type: String,
        required: true
    },
    slug:{
        type: String,
        required: true, 
        unique: true 
    },
    author:{
        type: String,
        default: '' 
    },
    category:{
        type: String,
        default: 'Other'
    },
    excerpt:{
        type: String,
        default: '' 
    },
    coverImage:{
        type: String,
        default: ''
    },
    tags:{
        type: [String], 
        default: [] 
    },
    status:{
        type: String, 
        enum: ['draft', 'published'],
        default: 'draft' 
    }
}, { timestamps: true });

const Blog = model("Blog", blogSchema);
export default Blog;