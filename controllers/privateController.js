require("dotenv").config();
const asyncHandler = require("express-async-handler");

const vd = require("../middleware/validator");
const bcrypt = require("bcryptjs");
const { matchedData, validationResult } = require("express-validator");

const jwt = require("jsonwebtoken");
const { verifyAdminToken } = require("../middleware/authenticator");

const { User } = require("../db/models/user");
const Post = require("../db/models/post");
const Comment = require("../db/models/comment");

// try to log-in (COMPLETED)
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
    const user = await User.findOne({
      email: validatedData.email,
      isAdmin: true,
    }).exec();
    if (!user) {
      return res.status(401).json({
        error: "could not find admin user",
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
          message: "successful admin login",
          token,
          user: {
            _id: user._id,
            name: user.fullName,
          },
        });
      }
    );
  }),
];

// view all posts (published, unpublished) (COMPLETED)
exports.allPostsGet = [
  verifyAdminToken,
  asyncHandler(async (req, res, next) => {
    const allPosts = await Post.find({
      "author.email": req.user.user.email,
    })
      .sort({ isPublished: -1, createdAt: -1 })
      .exec();
    res.status(200).json({
      message: "all admin posts",
      allPosts,
    });
  }),
];

// new post form (COMPLETED)
exports.createPostGet = [
  verifyAdminToken,
  (req, res, next) => {
    res.status(200).json({ message: "authorized to create new post" });
  },
];

// create the new post (COMPLETED)
exports.createPostPost = [
  verifyAdminToken,
  vd.pipe([
    vd.validateTitle,
    vd.validateOverview,
    vd.validateText,
    vd.validateIsPublished,
  ]),
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
          title: req.body.title,
          overview: req.body.overview,
          text: req.body.text,
          isPublished: req.body.isPublished,
        },
      });
    }

    const validatedData = matchedData(req);
    const newPost = await Post.create({
      title: validatedData.title,
      overview: validatedData.overview,
      text: validatedData.text,
      isPublished: validatedData.isPublished,
      author: {
        _id: req.user.user._id,
        fullName: req.user.user.fullName,
        email: req.user.user.email,
        password: req.user.user.password,
        isAdmin: req.user.user.isAdmin,
      },
    });

    res.status(201).json({
      message: "created new admin post",
      newPost,
    });
  }),
];

// view a specific post OR get info to edit post (COMPLETED)
exports.onePostGet = [
  verifyAdminToken,
  asyncHandler(async (req, res, next) => {
    const post = await Post.findById(req.params.postId).exec();
    if (!post) {
      return res.status(404).json({ error: "could not find resource" });
    }
    res.status(200).json({
      message: `info for admin post ${post.id}`,
      post,
    });
  }),
];

// edit a specific post (COMPLETED)
exports.onePostUpdate = [
  verifyAdminToken,
  vd.pipe([
    vd.validateTitle,
    vd.validateOverview,
    vd.validateText,
    vd.validateIsPublished,
  ]),
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
          title: req.body.title,
          overview: req.body.overview,
          text: req.body.text,
          isPublished: req.body.isPublished,
        },
      });
    }

    const post = await Post.findById(req.params.postId).exec();
    if (!post) {
      return res.status(404).json({ error: "could not find resource" });
    }

    const validatedData = matchedData(req);
    post.title = validatedData.title;
    post.overview = validatedData.overview;
    post.text = validatedData.text;
    post.isPublished = validatedData.isPublished;

    await post.save();

    res.status(201).json({
      message: `edited admin post ${req.params.postId}`,
      post,
    });
  }),
];

// delete a specific post (COMPLETED)
exports.onePostDelete = [
  verifyAdminToken,
  asyncHandler(async (req, res, next) => {
    const post = await Post.findById(req.params.postId).exec();
    if (!post) {
      return res.status(404).json({ error: "could not find resource" });
    }

    await Comment.deleteMany({ post: post._id });
    await Post.deleteOne({ _id: post._id });

    res.status(200).json({
      message: `deleted admin post ${req.params.postId}`,
    });
  }),
];

// view a specific post's comments (COMPLETED)
exports.commentsGet = [
  verifyAdminToken,
  asyncHandler(async (req, res, next) => {
    const post = await Post.findById(req.params.postId)
      .sort({ createdAt: -1 })
      .exec();
    if (!post) {
      return res.status(404).json({ error: "could not find resource" });
    }
    const allComments = await Comment.find({ post: req.params.postId })
      .sort({ createdAt: -1 })
      .exec();
    res.status(200).json({
      message: `showing comments for admin post ${req.params.postId}`,
      allComments,
    });
  }),
];

// create OWN comment (COMPLETED)
exports.createComment = [
  verifyAdminToken,
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
    if (!post) {
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
      message: `created new admin comment on post ${req.params.postId}`,
      newComment,
    });
  }),
];

// edit OWN comment (COMPLETED)
exports.editComment = [
  verifyAdminToken,
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
    if (!post) {
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
      message: `edited admin comment ${req.params.commentId} on post ${req.params.postId}`,
      comment,
    });
  }),
];

// delete ANY comment (COMPLETED)
exports.deleteComment = [
  verifyAdminToken,
  asyncHandler(async (req, res, next) => {
    const post = await Post.findById(req.params.postId).exec();

    if (!post) {
      return res.status(404).json({ error: "could not find resource" });
    }

    const comment = await Comment.findById(req.params.commentId).exec();
    if (!comment) {
      return res.status(404).json({ error: "could not find resource" });
    }

    await Comment.deleteOne({ _id: comment._id });

    res.status(200).json({
      message: `admin has deleted comment ${req.params.commentId} on post ${req.params.postId}`,
    });
  }),
];
