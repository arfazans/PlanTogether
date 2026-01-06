const mongoose = require("mongoose");
const {Schema} = mongoose;

const planSchema = new mongoose.Schema({
  groupId: {
    type: Schema.Types.ObjectId,
    ref: 'Group',
    required: true
  },
  pollMessageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
    default: null,
  },
  eventName: {
    type: String,
    trim: true
  },
  dateTime: {
    type: Date
  },
  location: {
    type: String,
    trim: true
  },
  budget: {
    type: Number
  },
  attendees: [{
    type: Schema.Types.ObjectId,
    ref: 'Credential'
  }],
  status: {
    type: String,
    enum: ['draft', 'confirmed', 'completed'],
    default: 'draft'
  },
  aiSummary: {
    type: String
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'Credential',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model("Plan", planSchema);