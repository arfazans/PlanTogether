const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "Credential", required: true },
  userName: { type: String, required: true },
  groupName: { type: String, default: "" },
  image: { type: String, required: true },
  caption: { type: String, default: "" },
  likes: { type: Number, default: 0 },
  comments: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model("Post", postSchema);
