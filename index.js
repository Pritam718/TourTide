const express = require("express");
const app = express();
const ejs = require("ejs");
const path = require("path");
require("dotenv").config();

app.set("view engine", "ejs");
app.set("views", "views");
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.render("home");
});
app.get("/login", (req, res) => {
  res.send("login");
});
app.get("/register", (req, res) => {
  res.send("register");
});
const port = process.env.PORT;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
