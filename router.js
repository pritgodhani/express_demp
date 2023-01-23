const express = require("express");
const app = express();

// import Routers

const userRouter = require("./routes/user/user");
// define Router


app.use("/user",userRouter);



module.exports = app;