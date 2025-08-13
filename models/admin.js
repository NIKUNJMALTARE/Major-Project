import mongoose from "mongoose";
import alumni from "./alumni.js";
const Schema = mongoose.Schema;
import * as dotenv from "dotenv";
dotenv.config();

// Admin schema inherits from Alumni schema
const adminSchema = new Schema({
  isAdmin: {
    type: Boolean,
    default: true,
  },
  adminLevel: {
    type: String,
    enum: ["super", "content", "user"],
    default: "content",
  },
});

// Create admin model by discriminating the alumni model
const Admin = alumni.discriminator("Admin", adminSchema);

export default Admin;
