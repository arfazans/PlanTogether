const mongoose = require("mongoose");
const { Schema } = mongoose;

const postSchema = new mongoose.Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'Credential',
    required: true
  },
  caption: {
    type: String,
    required: true,
    trim: true
  },
  image: {
    type: String, // URL to image
    default: null
  },
  groupName: {
    type: String,
    trim: true,
    default: null
  },
  likes: [{
    type: Schema.Types.ObjectId,
    ref: 'Credential'
  }],
  comments: [{
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'Credential',
      required: true
    },
    text: {
      type: String,
      required: true,
      trim: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, { timestamps: true });

module.exports = mongoose.model("Post", postSchema);