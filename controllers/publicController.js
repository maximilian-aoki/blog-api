require("dotenv").config();
const asyncHandler = require("express-async-handler");

const vd = require("../middleware/validator");
const bcrypt = require("bcryptjs");
const { matchedData, validationResult } = require("express-validator");

const jwt = require("jsonwebtoken");
const { verifyToken } = require("../middleware/authenticator");

const { User } = require("../db/models/user");
const Post = require("../db/models/post");
const Comment = require("../db/models/comment");

// sign-up post (COMPLETED)
exports.signupPost = [
  vd.pipe([vd.validateName, vd.validateEmail, vd.validatePassword]),
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
    const userExists = await User.findOne({
      email: validatedData.email,
    }).exec();

    if (userExists) {
      return res.status(400).json({
        error: "user email already exists",
        postVals: {
          email: req.body.email,
          password: req.body.password,
        },
      });
    }

    const bcryptHash = await bcrypt.hash(validatedData.password, 10);
    const newUser = await User.create({
      fullName: validatedData.fullName,
      email: validatedData.email,
      password: bcryptHash,
      isAdmin: false,
    });

    res.status(201).json({
      message: `added new public user ${newUser.fullName}`,
      redirect: "/log-in",
      newUser,
    });
  }),
];

// log-in post (COMPLETED)
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
          user: {
            _id: req.user.user._id,
            name: req.user.user.fullName,
          },
        });
      }
    );
  }),
];

// view all posts (published ones only!) (COMPLETED)
exports.allPostsGet = asyncHandler(async (req, res, next) => {
  const allPublicPosts = await Post.find({ isPublished: true }).exec();
  res.status(200).json({
    message: "all public published posts",
    allPublicPosts,
  });
});

// view specific post (COMPLETED)
exports.onePostGet = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.postId).exec();
  if (!post || post.isPublished === false) {
    return res.status(404).json({ error: "could not find resource" });
  }
  res.status(200).json({
    message: `showing public published post ${post.id}`,
    post,
  });
});

// view a specific post's comments (COMPLETED)
exports.commentsGet = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.postId)
    .sort({ createdAt: -1 })
    .exec();
  if (!post || post.isPublished === false) {
    return res.status(404).json({ error: "could not find resource" });
  }
  const allComments = await Comment.find({ post: req.params.postId })
    .sort({ createdAt: -1 })
    .exec();
  res.status(200).json({
    message: `showing comments for public published post ${req.params.postId}`,
    allComments,
  });
});

// create OWN comment (COMPLETED)
exports.createComment = [
  verifyToken,
  vd.pipe([vd.validateText]),
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
          text: req.body.text,
        },
      });
    }

    const post = await Post.findById(req.params.postId).exec();
    if (!post || post.isPublished === false) {
      return res.status(404).json({ error: "could not find resource" });
    }

    const validatedData = matchedData(req);
    const newComment = await Comment.create({
      text: validatedData.text,
      author: {
        _id: req.user.user._id,
        fullName: req.user.user.fullName,
        email: req.user.user.email,
        password: req.user.user.password,
        isAdmin: req.user.user.isAdmin,
      },
      post: post,
    });

    res.status(201).json({
      message: `created new comment on post ${req.params.postId}`,
      newComment,
    });
  }),
];

// edit OWN comment (COMPLETED)
exports.editComment = [
  verifyToken,
  vd.pipe([vd.validateText]),
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
          text: req.body.text,
        },
      });
    }

    const post = await Post.findById(req.params.postId).exec();
    if (!post || post.isPublished === false) {
      return res.status(404).json({ error: "could not find resource" });
    }

    const comment = await Comment.findById(req.params.commentId).exec();
    if (
      !comment ||
      comment.author._id.toString() !== req.user.user._id.toString()
    ) {
      return res.status(401).json({
        error: "unauthorized",
        redirect: `/posts`,
      });
    }

    const validatedData = matchedData(req);
    comment.text = validatedData.text;
    await comment.save();

    res.status(201).json({
      message: `edited comment ${req.params.commentId} on post ${req.params.postId}`,
      comment,
    });
  }),
];

// delete OWN comment (COMPLETED)
exports.deleteComment = [
  verifyToken,
  asyncHandler(async (req, res, next) => {
    const post = await Post.findById(req.params.postId).exec();

    if (!post || post.isPublished === false) {
      return res.status(404).json({ error: "could not find resource" });
    }

    const comment = await Comment.findById(req.params.commentId).exec();
    if (
      !comment ||
      comment.author._id.toString() !== req.user.user._id.toString()
    ) {
      return res.status(401).json({
        error: "unauthorized",
        redirect: `/posts`,
      });
    }

    await Comment.deleteOne({ _id: comment._id });

    res.status(200).json({
      message: `deleted comment ${req.params.commentId} on post ${req.params.postId}`,
    });
  }),
];
