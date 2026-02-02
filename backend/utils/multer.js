import multer from "multer";

const storage=multer({
    storage:multer.memoryStorage(),
    limits:{
        fileSize:50*1024*1024
    }
})

export default storage;