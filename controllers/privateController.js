const asyncHandler = require("express-async-handler");

// log-in
exports.loginGet = (req, res, next) =>
  res.status(200).json({ message: "get private login page" });

exports.loginPost = (req, res, next) =>
  // validate JWT
  res.status(200).json({ message: "successful login of admin" });

// view all posts (published, unpublished)
// needs authorization!
exports.allPostsGet = asyncHandler(async (req, res, next) => {
  // db call for all published/unpublished posts
  res.status(200).json({ message: "all admin posts" });
});

// new post form
// needs authorization!
exports.createPostGet = (req, res, next) => {
  res.status(200).json({ message: "new admin post form" });
};

// create a new post
// needs authorization!
exports.createPostPost = asyncHandler(async (req, res, next) => {
  // create a new post in db
  res.status(201).json({ message: "created new admin post" });
});

// view a specific post
// needs authorization!
exports.onePostGet = asyncHandler(async (req, res, next) => {
  // get specific post from db
  res.status(200).json({ message: `viewing admin post ${req.params.postId}` });
});

// edit a specific post
// needs authorization!
exports.onePostUpdate = asyncHandler(async (req, res, next) => {
  // update specific post in db
  res.status(201).json({ message: `edited admin post ${req.params.postId}` });
});

// delete a specific post
// needs authorization!
exports.onePostDelete = asyncHandler(async (req, res, next) => {
  // delete a specific post in db
  res.status(200).json({ message: `deleted admin post ${req.params.postId}` });
});

// view a specific post's comments
exports.commentsGet = asyncHandler(async (req, res, next) => {
  // db call for specific post's comments
  res.status(200).json({
    message: `showing comments for admin post ${req.params.postId}`,
  });
});

// create OWN comment
// needs authorization!
// needs input validation!
exports.createComment = asyncHandler(async (req, res, next) => {
  // check for errors in input validation and handle
  res.status(201).json({
    message: `created new admin comment on post ${req.params.postId}`,
  });
});

// edit OWN comment
// needs authorization!
// needs input validation!
exports.editComment = asyncHandler(async (req, res, next) => {
  // check for errors in input validation and handle
  res.status(201).json({
    message: `edited admin comment ${req.params.commentId} on post ${req.params.postId}`,
  });
});

// delete OWN comment
// needs authorization!
exports.deleteComment = asyncHandler(async (req, res, next) => {
  res.status(200).json({
    message: `deleted comment ${req.params.commentId} on post ${req.params.postId}`,
  });
});
