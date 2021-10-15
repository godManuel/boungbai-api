const path = require("path");
const hbs = require("express-handlebars");
require("dotenv").config();
const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);
const winston = require("winston");
require("winston-mongodb");
const config = require("config");
const cors = require("cors");
const mongoose = require("mongoose");
const posts = require("./routes/posts");
const auth = require("./routes/auth");
const users = require("./routes/users");
const courses = require("./routes/courses");
const express = require("express");

const app = express();

winston.add(winston.transports.File, { filename: "logfile.log" });
// winston.add(winston.transports.MongoDB, {
//     db: 'mongodb://admin:boungbai1@boungbaibackend-shard-00-00.ywgnf.mongodb.net:27017,boungbaibackend-shard-00-01.ywgnf.mongodb.net:27017,boungbaibackend-shard-00-02.ywgnf.mongodb.net:27017/boungbai?ssl=true&replicaSet=atlas-h9mscm-shard-0&authSource=admin&retryWrites=true&w=majority',
//     level: 'info'
// })

process.on("uncaughtException", (ex) => {
  console.log("WE GOT AN UNCAUGHT EXCEPTION");
  winston.error(ex.message, ex);
  process.exit(1);
});

process.on("unhandledRejection", (ex) => {
  console.log("WE GOT AN UNHANDLED REJECTION");
  winston.error(ex.message, ex);
  process.exit(1);
});

if (!config.get("jwtPrivateKey")) {
  console.log("FATAL ERROR: jwtPrivateKey is not defined");
  process.exit(1);
}

// Connecting to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then(() => {
    console.log("Connected to MongoDB...");
  })
  .catch((err) => {
    console.error("Connection to MongoDB failed!", err);
  });

// Calling middlewares
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: false }));
app.engine("hbs", hbs({ extname: ".hbs", defaultLayout: false }));
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));

// --- Custom Middlewares
app.use("/api/auth", auth);
app.use("/api/users", users);
app.use("/api/courses", courses);
app.use("/api/posts", posts);

// Index Route Message
app.get("/", (req, res) => {
  res.send("Welcome to Node.js");
});

// Setting the port value
const port = process.env.PORT || 8000;

// Starting our server with the port value
app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});
