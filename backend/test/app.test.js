import app from "../app.js";
import request from 'supertest';
import path from "path";
import { connecttoDB } from "../config/database.js";
import mongoose from "mongoose";

let token;
let sermon={};

beforeAll(async()=>{
    if(mongoose.connection.readyState===0){
        await connecttoDB();
        console.log("Connected to DB");
    }
    const res=await request(app)
        .post("/api/v1/auth/login")
        .send({
            username:process.env.ADMIN_USER,
            password:process.env.ADMIN_PASSWORD
        });
    expect(res.statusCode).toBe(200);
    token=res.body.token;
})



describe("Test the sermons routes",()=>{
    it("should create a new sermon when authenticated",async()=>{
        const res=await request(app)
            .post("/api/v1/sermons/post")
            .set("Authorization",`Bearer ${token}`)
            .field("title","Test Sermon")
            .field("description","Testing purpose")
            .attach("audio",path.join(process.cwd(),"test","sermon_audio_test.mp3"));

        sermon=res.body.data;
        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty("message","Sermon details uploaded successfully");
    },20000);

    it("It should not create a sermon without authentication",async()=>{
        const res=await request(app)
            .post("/api/v1/sermons/post")
            .field("title","Test Sermon")
            .field("description","Testing purpose")
            
        expect(res.statusCode).toEqual(401);  
    })

    it("Edit sermons with authentication",async()=>{
        const res=await request(app)
            .put(`/api/v1/sermons/edit/${sermon._id}`)
            .set("Authorization",`Bearer ${token}`)
            .field("title","Updated Test Sermon")
            .field("description","Testing purpose - updated")
            .attach("audio",path.join(process.cwd(),"test","sermon_audio_test.mp3"));
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("message","Sermon details updated successfully");
    });

    it("Edit sermons without authentication",async()=>{
        const res=await request(app)
            .put(`/api/v1/sermons/edit/${sermon._id}`)
            .field("title","Updated Test Sermon")
            .field("description","Testing purpose - updated");
        expect(res.statusCode).toEqual(401);
    });

    it("Delete sermons with authentication",async()=>{
        const res=await request(app)
            .delete(`/api/v1/sermons/delete/${sermon._id}`)
            .set("Authorization",`Bearer ${token}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("message","Sermon deleted successfully");
    });
        
})

afterAll(async()=>{
    await mongoose.connection.close();

})