import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  isEmailVerified: { type: Boolean, required: true },
  branch: { type: String, required: true },
  passingYear: { type: String, required: true },
  designation: { type: String, required: true },
  about: { type: String, required: true },
  github: { type: String, required: false },
  linkedin: { type: String, required: false },
}, {timestamps: true}); 

const User = mongoose.model('User', userSchema);

export default User;


