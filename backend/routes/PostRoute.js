const express = require("express");
const upload = require("../config/multer");
const { createPost, getAllPosts } = require("../controller/PostController");
const router = express.Router();

router.post("/create", upload.single('image'), createPost);
router.get("/all", getAllPosts);

module.exports = router;
