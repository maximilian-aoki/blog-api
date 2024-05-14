require("dotenv").config();
const asyncHandler = require("express-async-handler");
const vd = require("../middleware/validator");
const bcrypt = require("bcryptjs");
const { matchedData, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const verifyToken = require("../middleware/authenticator");

const { User } = require("../db/models/user");
const Post = require("../db/models/post");
const Comment = require("../db/models/comment");

// sign-up
exports.signupGet = (req, res, next) =>
  res.status(200).json({ message: "get public signup page" });

// sign-up post
// needs input validation!
// needs to check if user already exists
exports.signupPost = asyncHandler(async (req, res, next) =>
  res.status(201).json({
    message: "added new public user",
    body: req.body,
  })
);

// log-in get
exports.loginGet = (req, res, next) =>
  res.status(200).json({ message: "get public login page" });

// log-in post
exports.loginPost = [
  vd.pipe([vd.validateEmail, vd.validatePassword]),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (errors.errors.length) {
      return res.status(400).json({
        error: "user input validation failed",
        validationErrors: errors.errors.map((errorObj) => ({
          name: errorObj.path,
          msg: errorObj.msg,
        })),
        postVals: {
          email: req.body.email,
          password: req.body.password,
        },
      });
    }

    const validatedData = matchedData(req);
    const user = await User.findOne({ email: validatedData.email }).exec();
    if (!user) {
      return res.status(401).json({
        error: "could not find user",
        postVals: {
          email: req.body.email,
          password: req.body.password,
        },
      });
    }

    const bcryptMatch = await bcrypt.compare(
      validatedData.password,
      user.password
    );
    if (!bcryptMatch) {
      return res.status(401).json({
        error: "wrong password",
        postVals: {
          email: req.body.email,
          password: req.body.password,
        },
      });
    }

    jwt.sign(
      { user },
      process.env.JWT_SECRET,
      { expiresIn: 60 * 60 },
      (err, token) => {
        if (err) {
          return res.status(500).json({ error: err });
        }
        res.status(200).json({
          message: "successful public login",
          token,
        });
      }
    );
  }),
];

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
exports.createComment = [
  verifyToken,
  asyncHandler(async (req, res, next) => {
    // check for errors in input validation and handle
    res.status(201).json({
      message: `created new comment on post ${req.params.postId}`,
      body: req.body,
      user: req.user,
    });
  }),
];

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
