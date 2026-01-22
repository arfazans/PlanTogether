const express = require("express");
const upload = require("../config/multer");
const { createPost, getAllPosts, getUserPosts, likePost, addComment, getLikedUsers, updatePost, deletePost } = require("../controller/PostController");
const tokenAuth = require("../middleware/tokenAuth");
const router = express.Router();

router.post("/create", tokenAuth, upload.single('image'), createPost);
router.get("/all", tokenAuth, getAllPosts);
router.get("/user", tokenAuth, getUserPosts);
router.post("/like/:postId", tokenAuth, likePost);
router.post("/comment/:postId", tokenAuth, addComment);
router.get("/likes/:postId", getLikedUsers);
router.put("/update/:postId", tokenAuth, updatePost);
router.delete("/delete/:postId", tokenAuth, deletePost);

module.exports = router;
