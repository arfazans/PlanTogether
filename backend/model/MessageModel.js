const mongoose = require('mongoose');
const {Schema} = mongoose;


const messageSchema = new mongoose.Schema({
  senderId: { type: Schema.Types.ObjectId, ref: 'Credential', required: true },
  receiverId: { type: Schema.Types.ObjectId, ref: 'Credential' }, // Optional for group messages
  groupId: { type: Schema.Types.ObjectId, ref: 'Group' }, // Optional for direct messages
  messageType: { type: String, enum: ['direct', 'group', 'poll'], default: 'direct' },
  text: { type: String },
  image: { type: String },
  read: { type: Boolean, default: false },
  pollData: {
    planId: { type: Schema.Types.ObjectId, ref: 'Plan' },
    question: { type: String },
    options: [{
      text: { type: String },
      votes: [{ type: Schema.Types.ObjectId, ref: 'Credential' }]
    }]
  }
}, { timestamps: true });


module.exports = mongoose.model("Message",messageSchema)