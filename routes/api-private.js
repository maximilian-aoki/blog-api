const express = require("express");
const router = express.Router();

const privateController = require("../controllers/privateController");

// AUTHENTICATION ROUTES

// log-in page (POST) [all-access]
router.post("/log-in", privateController.loginPost);

// POST ROUTES

// view all published/unpublished posts (GET) [admin only]
router.get("/posts", privateController.allPostsGet);

// create a new post (GET, POST) [admin only]
router
  .route("/posts/create")
  .get(privateController.createPostGet)
  .post(privateController.createPostPost);

// view post or get post info (GET) [admin only]
router.get("/posts/:postId", privateController.onePostGet);

// edit post (PUT) [admin only]
router.put("/posts/:postId/update", privateController.onePostUpdate);

// delete post (DELETE) [admin only]
router.delete("/posts/:postId/delete", privateController.onePostDelete);

// COMMENT ROUTES

// view post's comments /add OWN comment (GET, POST) [admin only]
router
  .route("/posts/:postId/comments")
  .get(privateController.commentsGet)
  .post(privateController.createComment);

// edit OWN comment (PUT) [admin only]
router.put(
  "/posts/:postId/comments/:commentId/update",
  privateController.editComment
);

// delete ANY comment (DELETE) [admin only]
router.delete(
  "/posts/:postId/comments/:commentId/delete",
  privateController.deleteComment
);

module.exports = router;
