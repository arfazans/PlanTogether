const express = require('express');
const router = express.Router();
const { createPost, getUserPosts, getAllPosts, updatePost, deletePost, likePost, addComment } = require("../controller/PostController");
const tokenAuth = require("../middleware/tokenAuth");
const upload = require("../config/multer");

router
  .post("/create", tokenAuth, upload.single('postImage'), createPost)
  .get("/user/:userId", tokenAuth, getUserPosts)
  .get("/user", tokenAuth, getUserPosts)
  .get("/all", tokenAuth, getAllPosts)
  .put("/:postId", tokenAuth, updatePost)
  .delete("/:postId", tokenAuth, deletePost)
  .post("/:postId/like", tokenAuth, likePost)
  .post("/:postId/comment", tokenAuth, addComment);

module.exports = router;