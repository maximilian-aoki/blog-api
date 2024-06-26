const express = require("express");
const router = express.Router();

const publicController = require("../controllers/publicController");

// AUTHENTICATION ROUTES

// sign-up page (POST) [all-access]
router.post("/sign-up", publicController.signupPost);

// log-in page (POST) [all-access]
router.post("/log-in", publicController.loginPost);

// BLOG ROUTES

// view all blog posts (GET) [all-access]
router.get("/posts", publicController.allPostsGet);

// view specific blog post (GET) [all-access]
router.get("/posts/:postId", publicController.onePostGet);

// COMMENT ROUTES

// view or add OWN comments to specific blog post (GET all-access, POST users-only)
router
  .route("/posts/:postId/comments")
  .get(publicController.commentsGet)
  .post(publicController.createComment);

// edit OWN comment (PUT) [users only]
router.put(
  "/posts/:postId/comments/:commentId/update",
  publicController.editComment
);

// delete OWN comment (DELETE) [users only]
router.delete(
  "/posts/:postId/comments/:commentId/delete",
  publicController.deleteComment
);

module.exports = router;
