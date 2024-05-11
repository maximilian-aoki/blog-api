const express = require("express");
const router = express.Router();

const publicController = require("../controllers/publicController");

// sign-up page (GET, POST)
router
  .route("/sign-up")
  .get(publicController.signupGet)
  .post(publicController.signupPost);

// log-in page (GET, POST)
router
  .route("/log-in")
  .get(publicController.loginGet)
  .post(publicController.loginPost);

// view all blog posts (GET) [all-access]
router.get("/posts", publicController.allPostsGet);

// view specific blog post (GET) [all-access]
router.get("/posts/:postId", publicController.onePostGet);

// add OWN comment (POST) [users only]
router.post("/posts/:postId/comments", publicController.createComment);

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
