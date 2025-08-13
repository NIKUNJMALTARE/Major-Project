import User from "./../models/alumni.js";
import Admin from "./../models/admin.js";

let adminAuth = (req, res, next) => {
  let token = req.cookies.AITRConnect;
  User.findByToken(token, (err, user) => {
    if (err) throw err;
    if (!user) return res.redirect("/login");

    // Check if user is an admin (either by model type or isAdmin flag)
    if (user.__t !== "Admin" && user.isAdmin !== true) {
      console.log("User is not an admin:", user);
      return res.redirect("/noPermission");
    }

    console.log("Admin user found:", user.name, user.email);
    req.token = token;
    req.user = user;
    next();
  });
};

export default adminAuth;
