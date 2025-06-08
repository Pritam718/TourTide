require("dotenv").config();
const express = require("express");
const app = express();
const ejs = require("ejs");
const path = require("path");
const dbCon = require("./app/config/dbConnection");
const apiRoutes = require("./app/routers/ApiRouters/index");
const cookieParser = require("cookie-parser");
const ejsRoutes = require("./app/routers/EjsRouters/index");
const session = require("express-session");
const flash = require("connect-flash");

dbCon();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  session({
    secret: process.env.FLASH_SECRET,
    saveUninitialized: true,
    resave: true,
  })
);
app.use(flash());
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.delete_msg = req.flash("delete_msg");
  next();
});

app.set("view engine", "ejs");
app.set("views", "views");
app.use("/tourtide/tour", express.static(path.join(__dirname, "public")));
app.use("/tourtide/user", express.static(path.join(__dirname, "public")));

app.use("/api", apiRoutes);
app.use("/tourtide", ejsRoutes);

const port = process.env.PORT;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
