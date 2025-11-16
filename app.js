import express from "express";
import cors from "cors";
import bodyparser from "body-parser";
import cookieParser from "cookie-parser";
import connectdb from "./config/db.js";
import path from "path";

const __dirname = path.dirname(new URL(import.meta.url).pathname);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static("./public"));
app.set("views", "./views");
app.set("view engine", "ejs");
app.use(cookieParser());
app.use(
  cors({
    origin: "/",
  })
);

connectdb();
app.listen(process.env.PORT || 3000, function () {
  console.log(
    "➡️ Graduway Connect listening on port %d in %s mode 👍",
    this.address().port,
    app.settings.env
  );
});

import APIs from "./APIs/alumniDetail.js";
app.use("/api", APIs);

import adminAPI from "./APIs/adminAPI.js";
app.use("/api/admin", adminAPI);

import pages from "./routes/pages.js";
app.use("/", pages);

import adminRoutes from "./routes/admin.js";
app.use("/admin", adminRoutes);

// For debugging - log all registered routes
console.log("Registered Routes:");
app._router.stack.forEach((r) => {
  if (r.route && r.route.path) {
    console.log(
      `${Object.keys(r.route.methods)[0].toUpperCase()} ${r.route.path}`
    );
  } else if (r.name === "router" && r.handle.stack) {
    r.handle.stack.forEach((layer) => {
      if (layer.route) {
        const method = Object.keys(layer.route.methods)[0].toUpperCase();
        console.log(`${method} ${r.regexp} -> ${layer.route.path}`);
      }
    });
  }
});

app.get("*", async (req, res, next) => {
  try {
    res.render("error");
  } catch (error) {
    next(error);
  }
});
