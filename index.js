const express = require("express");
const app = express();
const ejs = require("ejs");
const path = require("path");
const dbCon = require("./app/config/dbConnection");
const userRouter = require("./app/routers/ApiRouters/userRouter");
require("dotenv").config();

dbCon();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.set("views", "views");
app.use(express.static(path.join(__dirname, "public")));

app.use("/api", userRouter);

const port = process.env.PORT;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
