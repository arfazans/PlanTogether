const PostModel = require("../model/PostModel");
const cloudinary = require('../config/cloudinary');

const createPost = async (req, res) => {
  try {
    const { caption, groupName } = req.body;
    const userId = req.user.userId;

    if (!caption) {
      return res.status(400).json({ success: false, message: "Caption is required" });
    }

    const postData = {
      userId,
      caption,
      groupName: groupName || null
    };

    if (req.file) {
      // Upload image to cloudinary
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'PlanTogether/posts'
      });
      postData.image = result.secure_url;
    }

    const newPost = await new PostModel(postData).save();

    const populatedPost = await PostModel.findById(newPost._id).populate('userId', 'name profileImage');
    
    res.json({ success: true, message: "Post created successfully", post: populatedPost });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Failed to create post" });
  }
};

const getUserPosts = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.userId;
    
    const posts = await PostModel.find({ userId })
      .populate('userId', 'name profileImage')
      .populate('likes', 'name profileImage')
      .populate('comments.userId', 'name profileImage')
      .sort({ createdAt: -1 });
    
    res.json({ success: true, posts });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Failed to fetch posts" });
  }
};

const getAllPosts = async (req, res) => {
  try {
    const posts = await PostModel.find()
      .populate('userId', 'name profileImage')
      .populate('likes', 'name profileImage')
      .populate('comments.userId', 'name profileImage')
      .sort({ createdAt: -1 });
    
    res.json({ success: true, posts });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Failed to fetch posts" });
  }
};

const updatePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { caption } = req.body;
    const userId = req.user.userId;

    const post = await PostModel.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    if (post.userId.toString() !== userId) {
      return res.status(403).json({ success: false, message: "Not authorized to edit this post" });
    }

    post.caption = caption;
    await post.save();

    const updatedPost = await PostModel.findById(postId).populate('userId', 'name profileImage');
    
    res.json({ success: true, message: "Post updated successfully", post: updatedPost });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Failed to update post" });
  }
};

const deletePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.userId;

    const post = await PostModel.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    if (post.userId.toString() !== userId) {
      return res.status(403).json({ success: false, message: "Not authorized to delete this post" });
    }

    await PostModel.findByIdAndDelete(postId);
    
    res.json({ success: true, message: "Post deleted successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Failed to delete post" });
  }
};

const likePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.userId;

    const post = await PostModel.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    const isLiked = post.likes.includes(userId);
    
    if (isLiked) {
      post.likes = post.likes.filter(id => id.toString() !== userId);
    } else {
      post.likes.push(userId);
    }

    await post.save();
    
    const updatedPost = await PostModel.findById(postId)
      .populate('userId', 'name profileImage')
      .populate('likes', 'name profileImage')
      .populate('comments.userId', 'name profileImage');
    
    res.json({ success: true, post: updatedPost, isLiked: !isLiked });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Failed to like post" });
  }
};

const addComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { text } = req.body;
    const userId = req.user.userId;

    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: "Comment text is required" });
    }

    const post = await PostModel.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    post.comments.push({ userId, text: text.trim() });
    await post.save();
    
    const updatedPost = await PostModel.findById(postId)
      .populate('userId', 'name profileImage')
      .populate('likes', 'name')
      .populate('comments.userId', 'name profileImage');
    
    res.json({ success: true, post: updatedPost });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Failed to add comment" });
  }
};

module.exports = { createPost, getUserPosts, getAllPosts, updatePost, deletePost, likePost, addComment };