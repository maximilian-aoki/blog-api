const express = require("express");
const router = express.Router();

const privateController = require("../controllers/privateController");

// log-in page (GET, POST)
router
  .route("/log-in")
  .get(privateController.loginGet)
  .post(privateController.loginPost);

// view all published/unpublished posts (GET)
router.get("/posts", privateController.allPostsGet);

// create a new post (GET, POST)

// view post (GET)

// edit post (PUT)

// delete post (DELETE)

// add ANY comment (POST)

// edit own comment (PUT)

// delete ANY comment (DELETE)

module.exports = router;
