const path = require("path");
const hbs = require("express-handlebars");
require("dotenv").config();
const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);
const winston = require("winston")
require("winston-mongodb");
const cors = require("cors");
const posts = require("./routes/posts");
const auth = require("./routes/auth");
const users = require("./routes/users");
const courses = require("./routes/courses");
const category = require("./routes/category");
const express = require("express");
const connectDB = require("./config/mongo-db");
const errorHandler = require("./middleware/error")

const app = express();

// Logging exceptions to logfile and MongoDB
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
app.use("/api/category", category)
app.use("/api/posts", posts);

// Index Route Message
app.get("/", (req, res) => {
  res.send("Boungbai API with Node.js & Express");
});

// Setting the port value
const port = process.env.PORT || 8500;

// Error-handling middleware
app.use(errorHandler)

// Starting our server with the port value
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
