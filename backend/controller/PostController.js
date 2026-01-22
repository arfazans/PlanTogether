const Post = require("../model/PostModel");
const CredentialModel = require("../model/CredentialModel");
const cloudinary = require("../config/cloudinary");

exports.createPost = async (req, res) => {
  try {
    const { caption, groupName } = req.body;
    const userId = req.user.userId;

    if (!req.file) {
      return res.status(400).json({ success: false, message: "Image is required" });
    }

    const user = await CredentialModel.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;
    const uploadResult = await cloudinary.uploader.upload(dataURI, {
      folder: "posts"
    });

    const newPost = new Post({
      userId,
      userName: user.name,
      groupName: groupName || "",
      image: uploadResult.secure_url,
      caption
    });

    await newPost.save();
    res.status(201).json({ success: true, post: newPost });
  } catch (error) {
    console.error("Error in createPost:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllPosts = async (req, res) => {
  try {
    const userId = req.user.userId;
    const posts = await Post.find().sort({ createdAt: -1 });
    const formattedPosts = posts.map(post => {
      const postObj = post.toObject();
      const likesArray = Array.isArray(postObj.likes) ? postObj.likes : [];
      const isLiked = likesArray.some(likeId => String(likeId) === String(userId));
      return {
        ...postObj,
        likes: likesArray,
        comments: Array.isArray(postObj.comments) ? postObj.comments : [],
        isLiked: isLiked
      };
    });
    res.status(200).json({ success: true, posts: formattedPosts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getUserPosts = async (req, res) => {
  try {
    const userId = req.user.userId;
    const posts = await Post.find({ userId }).sort({ createdAt: -1 });
    const formattedPosts = posts.map(post => ({
      ...post.toObject(),
      likes: post.likes || [],
      comments: post.comments || [],
      isLiked: post.likes ? post.likes.includes(userId) : false
    }));
    res.status(200).json({ success: true, posts: formattedPosts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.likePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.userId;
    
    // First ensure the post has proper array structure
    await Post.updateOne(
      { _id: postId, $or: [{ likes: { $type: "number" } }, { likes: { $exists: false } }] },
      { $set: { likes: [] } }
    );
    
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    const isLiked = post.likes.includes(userId);
    
    if (isLiked) {
      await Post.findByIdAndUpdate(postId, { $pull: { likes: userId } });
    } else {
      await Post.findByIdAndUpdate(postId, { $addToSet: { likes: userId } });
    }
    
    const updatedPost = await Post.findById(postId);
    res.status(200).json({ success: true, isLiked: !isLiked, likesCount: updatedPost.likes.length });
  } catch (error) {
    console.error("Like error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.addComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { text } = req.body;
    const userId = req.user.userId;
    
    // First ensure the post has proper array structure
    await Post.updateOne(
      { _id: postId, $or: [{ comments: { $type: "number" } }, { comments: { $exists: false } }] },
      { $set: { comments: [] } }
    );
    
    const user = await CredentialModel.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    
    const comment = {
      userId,
      userName: user.name,
      text,
      createdAt: new Date()
    };
    
    const post = await Post.findByIdAndUpdate(
      postId,
      { $push: { comments: comment } },
      { new: true }
    );
    
    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }
    
    res.status(200).json({ success: true, comment, commentsCount: post.comments.length });
  } catch (error) {
    console.error("Comment error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getLikedUsers = async (req, res) => {
  try {
    const { postId } = req.params;
    const post = await Post.findById(postId).populate('likes', 'name');
    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }
    res.status(200).json({ success: true, likedUsers: post.likes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updatePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { caption } = req.body;
    const userId = req.user.userId;
    
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }
    
    if (post.userId.toString() !== userId) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }
    
    post.caption = caption;
    await post.save();
    
    res.status(200).json({ success: true, post });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.userId;
    
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }
    
    if (post.userId.toString() !== userId) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }
    
    await Post.findByIdAndDelete(postId);
    res.status(200).json({ success: true, message: "Post deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
