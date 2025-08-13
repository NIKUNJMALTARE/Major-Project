import mongoose from "mongoose";
import * as dotenv from "dotenv";
import bcrypt from "bcrypt";
dotenv.config();

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost/alumconnect")
  .then(() => console.log("Connected to MongoDB..."))
  .catch((err) => console.error("Could not connect to MongoDB...", err));

// Import models
import "./models/alumni.js";
const Alumni = mongoose.model("Alumnus");

// Define admin schema
const adminSchema = new mongoose.Schema({
  isAdmin: {
    type: Boolean,
    default: true,
  },
  adminLevel: {
    type: String,
    enum: ["super", "content", "user"],
    default: "super",
  },
});

// Create Admin model as discriminator
const Admin = Alumni.discriminator("Admin", adminSchema);

async function createAdmin() {
  try {
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({});
    if (existingAdmin) {
      console.log("Admin already exists:", existingAdmin.email);
      mongoose.connection.close();
      return;
    }

    // Hash password
    const salt = 10;
    const password = "admin123";
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create admin
    const admin = new Admin({
      name: "Super Admin",
      email: "admin@example.com",
      username: "admin",
      password: hashedPassword,
      password2: hashedPassword,
      batch: 2023,
      branch: "Admin",
      degree: "Admin",
      designation: "Super Admin",
      city: "Admin City",
      image: "./images/user.png",
      adminLevel: "super",
      isAdmin: true,
    });

    // Save admin
    const result = await admin.save();
    console.log("Admin created successfully:", result.email);
  } catch (error) {
    console.error("Error creating admin:", error.message);
  } finally {
    mongoose.connection.close();
  }
}

createAdmin();
