// @Import - Built-in modules
const path = require("path");
// @Import - Third-party modules
const express = require("express");
const hbs = require("express-handlebars");
require("dotenv").config();
const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);
const winston = require("winston")
require("winston-mongodb");
const cors = require("cors");
const helmet = require("helmet");
const xss = require("xss-clean");
const rateLimit = require("express-rate-limit");
// @Import - Custom modules
const posts = require("./routes/posts");
const auth = require("./routes/auth");
const users = require("./routes/users");
const courses = require("./routes/courses");
const category = require("./routes/category");
const connectDB = require("./config/mongo-db");

const app = express();

// LOGGING EXCEPTIONS TO A FILE
winston.add(new winston.transports.File({ filename: 'logfile.log' }));
winston.add(new winston.transports.MongoDB({
    db: process.env.MONGO_URI,
    level: 'info'
}))

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

// SETUP FOR PRODUCTION & SECURITY
app.set("trust proxy", 1);
app.use(rateLimit({
  windowsMS: 15 * 60 * 1000,
  max: 100
}));
app.use(cors());
app.use(helmet());
app.use(xss())

// EXPRESS MIDDLEWARES
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: false }));

// VIEW ENGINE CONFIG
app.engine("hbs", hbs({ extname: ".hbs", defaultLayout: false }));
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));

// ROUTES
app.use("/api/auth", auth);
app.use("/api/users", users);
app.use("/api/courses", courses);
app.use("/api/category", category)
app.use("/api/posts", posts);

// INDEX API PAGE
app.get("/", (req, res) => {
  res.send("Boungbai API with Node.js & Express");
});

// PORT VALUE
const port = process.env.PORT || 8500;

// STARTING OUR SERVER WITH A START FUNCTION
const start = async() => {
  try {
    await connectDB()
    app.listen(port, () => {
      console.log(`Listening on port ${port}...`);
    });
  } catch (error) {
    console.log(error);
  }
}

start()
