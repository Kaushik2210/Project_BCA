import app from "./app.js";
import { connecttoDB } from "./config/database.js";

connecttoDB().then(()=>{
    app.listen(PORT,()=>{
         console.log(`The server is running on localhost:${PORT}`)
    })
})