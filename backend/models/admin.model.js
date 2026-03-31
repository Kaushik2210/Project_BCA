// Import Mongoose's 'model' factory function and 'Schema' class.
// Schema defines the shape of documents in a collection. model() compiles the schema into a Model.
import { model, Schema } from "mongoose";

// Import the bcrypt library for hashing passwords securely.
// bcrypt uses a one-way hashing algorithm, meaning a hashed password cannot be reversed back to plain text.
import bcrypt from "bcrypt";

// Define the Mongoose schema for the Admin collection.
// This schema enforces that every Admin document must have a username and password.
const adminSchema = new Schema({
    username: {
        type: String,       // Data type is a string
        required: true,     // This field is mandatory — MongoDB will reject inserts without it
        unique: true,       // Creates a unique index — no two admins can share the same username
    },
    password: {
        type: String,       // Stored as a hashed string (NOT plain text)
        required: true      // Password is mandatory
    }
})

// PRE-SAVE MIDDLEWARE (Hook):
// This function runs automatically BEFORE every `.save()` call on an Admin document.
// Its job is to hash the password so we never store plain text passwords in the database.
adminSchema.pre('save', async function(){
    // `this.isModified("password")` checks if the password field was actually changed.
    // If the admin's username was updated but password stayed the same, skip hashing.
    if(!this.isModified("password")) return next();

    try {
        // Hash the plain-text password using bcrypt with a salt round of 10.
        // Salt rounds determine how computationally expensive the hash is (higher = slower but more secure).
        this.password = await bcrypt.hash(this.password, 10);
    } catch (error) {
        // If hashing fails, throw the error to prevent saving an unhashed password.
        throw error
    }
})

// INSTANCE METHOD:
// Adds a custom method to every Admin document instance.
// This is called during login to compare the submitted plain-text password against the stored hash.
adminSchema.methods.comparePassword = async function(password){
    // `bcrypt.compare()` hashes the input and compares it to the stored hash.
    // Returns true if they match, false otherwise.
    return await bcrypt.compare(password, this.password);
}

// Compile the schema into a Mongoose Model and bind it to the 'Admin' MongoDB collection.
const Admin = new model('Admin', adminSchema);

// Export the Admin model for use in controllers.
export { Admin }