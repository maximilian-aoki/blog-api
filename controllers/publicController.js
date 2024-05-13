const asyncHandler = require("express-async-handler");

// sign-up
exports.signupGet = (req, res, next) =>
  res.status(200).json({ message: "get public signup page" });

exports.signupPost = asyncHandler(async (req, res, next) =>
  res.status(201).json({
    message: "added new public user",
    body: req.body,
  })
);

// log-in
exports.loginGet = (req, res, next) =>
  res.status(200).json({ message: "get public login page" });

exports.loginPost = asyncHandler(async (req, res, next) =>
  res.status(200).json({
    message: "successful public login",
    body: req.body,
  })
);

// view all posts (published ones only!)
exports.allPostsGet = asyncHandler(async (req, res, next) => {
  // db call for all published posts
  res.status(200).json({ message: "all public published posts" });
});

// view specific post
exports.onePostGet = asyncHandler(async (req, res, next) => {
  // db call for specific post
  res.status(200).json({
    message: `showing public published post ${req.params.postId}`,
  });
});

// view a specific post's comments
exports.commentsGet = asyncHandler(async (req, res, next) => {
  // db call for specific post's comments
  res.status(200).json({
    message: `showing comments for public published post ${req.params.postId}`,
  });
});

// create OWN comment
// needs authorization!
// needs input validation!
exports.createComment = asyncHandler(async (req, res, next) => {
  // check for errors in input validation and handle
  res.status(201).json({
    message: `created new comment on post ${req.params.postId}`,
    body: req.body,
  });
});

// edit OWN comment
// needs authorization!
// needs input validation!
exports.editComment = asyncHandler(async (req, res, next) => {
  // check for errors in input validation and handle
  res.status(201).json({
    message: `edited comment ${req.params.commentId} on post ${req.params.postId}`,
    body: req.body,
  });
});

// delete OWN comment
// needs authorization!
exports.deleteComment = asyncHandler(async (req, res, next) => {
  res.status(200).json({
    message: `deleted comment ${req.params.commentId} on post ${req.params.postId}`,
  });
});
