import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    googleId: { type: String, unique: true, sparse: true },  
    email:    { type: String, required: true, unique: true },
    name:     { type: String, required: true },
    avatar:   { type: String, default: 'https://i.pinimg.com/736x/9e/c0/f8/9ec0f877571edc437f89c15c08081533.jpg' },
    password: { type: String }   
}, { timestamps: true });

const User = mongoose.model('user', userSchema);

export default User;