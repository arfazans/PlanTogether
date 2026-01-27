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
    const posts = await Post.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, posts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
