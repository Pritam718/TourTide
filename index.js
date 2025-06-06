require("dotenv").config();
const express = require("express");
const app = express();
const ejs = require("ejs");
const path = require("path");
const dbCon = require("./app/config/dbConnection");
const userRouter = require("./app/routers/ApiRouters/userRouter");
const cookieParser = require("cookie-parser");
const homeRouter = require("./app/routers/EjsRouters/homeRouter");


dbCon();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.set("view engine", "ejs");
app.set("views", "views");
app.use(express.static(path.join(__dirname, "public")));


app.use("/api", userRouter);
app.use(homeRouter);


const port = process.env.PORT;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
