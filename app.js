const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");

const apiPublicRouter = require("./routes/api-public");
const apiPrivateRouter = require("./routes/api-private");

const app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// ROUTES
app.use("/api/public/", apiPublicRouter);
app.use("/api/private", apiPrivateRouter);

// home route
app.get("/", (req, res, next) => {
  res.status(200).json({ message: "welcome to the blog home page!" });
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set error and provide in development
  const message = err.message;
  const error = req.app.get("env") === "development" ? err : {};

  // return error JSON
  res.status(err.status || 500).json({
    error: {
      message,
      status: error.status,
      stack: error.stack,
    },
  });
});

module.exports = app;
