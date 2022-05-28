// @Import - Built-in modules
const path = require("path");
// @Import - Third-party modules
const express = require("express");
const hbs = require("express-handlebars");
const dotenv = require("dotenv");
const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);
const winston = require("winston");
const cors = require("cors");
const helmet = require("helmet");
const xss = require("xss-clean");
// @Import - Custom modules
const posts = require("./routes/posts");
const auth = require("./routes/auth");
const users = require("./routes/users");
const courses = require("./routes/courses");
const category = require("./routes/category");
const tutorials = require("./routes/tutorials");
const connectDB = require("./config/mongo-db");

/* Init Express App **/
const app = express();

/* Specify path to env. variables **/
dotenv.config({ path: "./vars/.env" });

/* Configure winston for logging errors **/
winston.add(new winston.transports.File({ filename: "logfile.log" }));

process.on("uncaughtException", (ex) => {
  console.log("WE GOT AN UNCAUGHT EXCEPTION");
  winston.error(ex.message, ex);
  process.exit(1);
});

winston.exceptions.handle(
  new winston.transports.File({ filename: "uncaughtExceptions.log" })
);

process.on("unhandledRejection", (ex) => {
  throw ex;
});

/* Production middlewares **/
app.use(cors());
app.use(helmet());
app.use(xss());

/* Express middlewares **/
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: false }));

/* Express-handlebars middlewares **/
app.engine("hbs", hbs({ extname: ".hbs", defaultLayout: false }));
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));

/* Routes **/
app.use("/api/auth", auth);
app.use("/api/users", users);
app.use("/api", courses);
app.use("/api/category", category);
app.use("/api/posts", posts);
app.use("/api", tutorials);

/* Index route **/
app.get("/", (req, res) => {
  res.send("Boungbai API with Node.js & Express");
});

/* Port **/
const port = process.env.PORT || 8500;

/* Start Application **/
const start = async () => {
  try {
    await connectDB();
    app.listen(port, () => {
      console.log(`Listening on port ${port}...`);
    });
  } catch (error) {
    console.log(error);
  }
};

start();
