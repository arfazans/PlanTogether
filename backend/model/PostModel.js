const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "Credential", required: true },
  userName: { type: String, required: true },
  groupName: { type: String, default: "" },
  image: { type: String, required: true },
  caption: { type: String, default: "" },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Credential" }],
  comments: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "Credential", required: true },
    userName: { type: String, required: true },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model("Post", postSchema);
