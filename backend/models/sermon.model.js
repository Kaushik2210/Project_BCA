import mongoose from "mongoose";

const sermonSchema=mongoose.Schema({
    title:{
        type:String,
        trim:true,
    },
    description:{
        type:String,
        trim:true
    },
    sermon_url:{
        type:String,
        trim:true,
        required:true
    },
    sermon_public_id:{
        type:String,
        trime:true,
        required:true
    }
})

const Sermon=mongoose.model('Sermon',sermonSchema);
export default Sermon;