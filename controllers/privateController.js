const asyncHandler = require("express-async-handler");

// log-in
exports.loginGet = (req, res, next) =>
  res.status(200).json({ message: "get public login page" });

exports.loginPost = (req, res, next) =>
  res.status(200).json({ message: "successful login" });

// view all posts (published, unpublished)
// needs authorization!
exports.allPostsGet = asyncHandler(async (req, res, next) => {
  // db call for all published/unpublished posts
  res.status(200).json({ message: "all public published posts" });
});
