require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const helmet = require("helmet");
const bodyParser = require("body-parser");
var cors = require("cors");
const routes = require("./router");
const e = require("express");
const morgan = require("morgan");
const { createServer } = require("http");

// Middleware
const app = express();
const httpServer = createServer(app);

app.use(bodyParser.json({ limit: "50mb" }));
app.use("/uploads", express.static("uploads"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(cors());
app.use(morgan("dev"));

// Routes
app.use("/api/v1", routes);

// Connect to MongoDb
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true, 
    useFindAndModify: false,
  })

  .then(async () => {
    const port = process.env.PORT || 5000;
    httpServer.listen(port);
    // postScheduler();
    console.log(`Server serve with port number: ${port} ...🚀🚀`);
    console.log("mongoDB connected.....");
  })
  .catch((err) => {
    console.log(err);
  });
