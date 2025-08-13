import express from "express";
import alumni from "../models/alumni.js";
import Admin from "../models/admin.js";
import post from "../models/post.js";
import adminAuth from "../middlewares/adminAuth.js";

const router = express.Router();

// Admin dashboard route
router.get("/dashboard", adminAuth, async (req, res, next) => {
  try {
    res.render("admin", { user: req.user });
  } catch (error) {
    next(error);
  }
});

// Get all users
router.get("/users", adminAuth, async (req, res, next) => {
  try {
    const users = await alumni.find({}).sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    next(error);
  }
});

// Get single user by ID
router.get("/user/:id", adminAuth, async (req, res, next) => {
  try {
    const user = await alumni.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    next(error);
  }
});

// Add new user (could be admin or alumni)
router.post("/addUser", adminAuth, async (req, res, next) => {
  try {
    const {
      name,
      email,
      username,
      password,
      password2,
      batch,
      branch,
      degree,
      userType,
      adminLevel,
    } = req.body;

    // Check if email already exists
    const existingUser = await alumni.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email already exists" });

    // Check if username already exists
    const existingUsername = await alumni.findOne({ username });
    if (existingUsername)
      return res.status(400).json({ message: "Username already exists" });

    // Check if passwords match
    if (password !== password2)
      return res.status(400).json({ message: "Passwords do not match" });

    let userData = {
      name,
      email,
      username,
      password,
      password2,
      batch: parseInt(batch),
      branch,
      degree,
      designation: req.body.designation || "Student",
      city: req.body.city || "",
      linkedin: req.body.linkedin || "",
      company: req.body.company || "",
      bio: req.body.bio || "",
      image: req.body.image || "./images/user.png",
    };

    let newUser;

    if (userType === "admin") {
      // Only super admins can create other admins
      if (req.user.adminLevel !== "super") {
        return res
          .status(403)
          .json({ message: "Only Super Admins can create other admins" });
      }
      // Create admin user
      userData.adminLevel = adminLevel || "content";
      newUser = new Admin(userData);
    } else {
      // Create regular alumni user
      newUser = new alumni(userData);
    }

    await newUser.save();
    res.status(201).json({ success: true, user: newUser });
  } catch (error) {
    next(error);
  }
});

// Update user
router.post("/updateUser", adminAuth, async (req, res, next) => {
  try {
    const { userId, ...updateData } = req.body;

    // Convert batch to integer if provided
    if (updateData.batch) {
      updateData.batch = parseInt(updateData.batch);
    }

    const updatedUser = await alumni.findByIdAndUpdate(userId, updateData, {
      new: true,
    });

    if (!updatedUser)
      return res.status(404).json({ message: "User not found" });

    res.json({ success: true, user: updatedUser });
  } catch (error) {
    next(error);
  }
});

// Delete user
router.delete("/deleteUser/:id", adminAuth, async (req, res, next) => {
  try {
    const userId = req.params.id;

    // Find the user to be deleted
    const userToDelete = await alumni.findById(userId);
    if (!userToDelete)
      return res.status(404).json({ message: "User not found" });

    // Check if user is trying to delete themselves
    if (userId === req.user._id.toString()) {
      return res
        .status(400)
        .json({ message: "Cannot delete your own account" });
    }

    // Only super admins can delete other admins
    if (userToDelete.__t === "Admin" && req.user.adminLevel !== "super") {
      return res
        .status(403)
        .json({ message: "Only Super Admins can delete admin accounts" });
    }

    // Delete user's posts
    if (userToDelete.posts && userToDelete.posts.length > 0) {
      await post.deleteMany({ _id: { $in: userToDelete.posts } });
    }

    // Delete the user
    const result = await alumni.findByIdAndDelete(userId);

    res.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    next(error);
  }
});

// Get all posts
router.get("/posts", adminAuth, async (req, res, next) => {
  try {
    const posts = await post.find({}).sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    next(error);
  }
});

// Get single post by ID
router.get("/post/:id", adminAuth, async (req, res, next) => {
  try {
    const postData = await post.findById(req.params.id);
    if (!postData) return res.status(404).json({ message: "Post not found" });
    res.json(postData);
  } catch (error) {
    next(error);
  }
});

// Create new post
router.post("/createPost", adminAuth, async (req, res, next) => {
  try {
    const postData = {
      ...req.body,
      createdBy: req.user.name,
      designation: req.user.designation,
      userId: req.user.username,
      image: req.user.image,
    };

    const newPost = new post(postData);
    const savedPost = await newPost.save();

    // Add post to user's posts array
    let user = await alumni.findById(req.user._id);
    let posts = user.posts || [];
    posts.push(savedPost._id);
    await alumni.updateOne({ _id: req.user._id }, { posts });

    res.status(201).json({ success: true, post: savedPost });
  } catch (error) {
    next(error);
  }
});

// Update post
router.post("/updatePost", adminAuth, async (req, res, next) => {
  try {
    const { postId, ...updateData } = req.body;

    const updatedPost = await post.findByIdAndUpdate(postId, updateData, {
      new: true,
    });

    if (!updatedPost)
      return res.status(404).json({ message: "Post not found" });

    res.json({ success: true, post: updatedPost });
  } catch (error) {
    next(error);
  }
});

// Delete post
router.delete("/deletePost/:id", adminAuth, async (req, res, next) => {
  try {
    const postId = req.params.id;

    // Find the post to get the user ID
    const postData = await post.findById(postId);

    if (!postData) return res.status(404).json({ message: "Post not found" });

    // Delete the post
    await post.findByIdAndDelete(postId);

    // Remove post from user's posts array
    const creator = await alumni.findOne({ username: postData.userId });

    if (creator) {
      const updatedPosts = creator.posts.filter((p) => p.toString() !== postId);
      await alumni.updateOne({ _id: creator._id }, { posts: updatedPosts });
    }

    res.json({ success: true, message: "Post deleted successfully" });
  } catch (error) {
    next(error);
  }
});

export default router;
