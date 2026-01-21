

const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const CredentialModel = require('../model/CredentialModel');
const MessageModel = require('../model/MessageModel');
const cloudinary = require('../config/cloudinary');


const getUserForSidebar = async (req, res) => {

    try {
        const myId = req.user.userId;
        // console.log("myId:", myId);


        const users = await CredentialModel.find({_id:{$ne:myId}}).select('-password')
        // console.log(users);

        res.status(200).json({success:true,users});


    } catch (error) {
        console.log("Error in getUserForSidebar:", error);
        res.status(500).json({ error: "getUserForSidebar Controller Error",error });
    }
}

const getMessages = async (req, res) => {
    try {
        const {id:userToChatId} = req.params
        const myId = req.user.userId;

        const messages =await MessageModel.find({
            $or:[
            {senderId:myId,receiverId:userToChatId},
            {senderId:userToChatId,receiverId:myId}
            ]
        })
        res.status(200).json( {success:true,messages} );
    } catch (error) {
        console.log("Error in getMessages:", error);
        res.status(500).json({ error: "getMessages Controller Error",error });
    }
}

const sendMessage = async (req, res) => {
    try {
        const {text} = req.body;
        const {id:receiverId} = req.params;
        const senderId = req.user.userId;

        if(!text && !req.file){
            return res.status(400).json({error:"Message is empty"})
        }
        let imageUrl;
        if(req.file){
            const b64 = Buffer.from(req.file.buffer).toString('base64');
            const dataURI = `data:${req.file.mimetype};base64,${b64}`;
            const uploadResponse = await cloudinary.uploader.upload(dataURI);
            imageUrl = uploadResponse.secure_url;
        }

        const newMessage = new MessageModel({
            senderId,
            receiverId,
            text,
            image:imageUrl
        })
        await newMessage.save();

        //real time functionality goes here using socket.io

        res.status(200).json({success:true,message:newMessage
        })
    } catch (error) {
        console.log("Error in sendMessage:", error);
        res.status(500).json({ error: "sendMessage Controller Error",error });

    }
}

const getRecentMessages = async (req, res) => {
  try {
    const myId = mongoose.Types.ObjectId.createFromHexString(req.user.userId); // convert string to objectID

    // Aggregate to get the latest message for each conversation
    const recentMessages = await MessageModel.aggregate([
      { $match: { $or: [{ senderId: myId }, { receiverId: myId }] } },
      { $sort: { createdAt: -1 } }, // newest messages first
      { $group: {
        _id: {
          $cond: [
            { $eq: ["$senderId", myId] },
            "$receiverId",
            "$senderId"
          ]
        }, // group by other user ID
        text: { $first: "$text" },
        createdAt: { $first: "$createdAt" },
        receiverId: { $first: "$receiverId" }, // ADD: latest receiver
        read: { $first: "$read" }              // ADD: latest read state
      } }
    ]);

    // Format recent messages for sidebar: { userId: lastMessageText }
    const result = {};
    recentMessages.forEach(msg => {
      if (msg._id) {
        result[msg._id.toString()] = msg.text;
      }
    });

    // Unread indicator relies on latest message being unread and sent to you
    const unreadUsers = {};
    recentMessages.forEach(msg => {
      // Only mark as unread if last message was sent to me and still unread
      if (
        msg._id &&
        msg.receiverId &&
        msg.receiverId.toString() === myId.toString() &&
        msg.read === false
      ) {
        unreadUsers[msg._id.toString()] = true;
      }
    });

    res.status(200).json({ success: true, recentMessages: result, unreadUsers });
  } catch (error) {
    console.log("Error in getRecentMessages:", error);
    res.status(500).json({ error: "getRecentMessages Controller Error", error });
  }
};



const markMessagesRead = async (req, res) => {
  try {
    const receiverId = req.user.id; // from tokenAuth or session
    const senderId = req.params.id;

    await Message.updateMany(
      { senderId, receiverId, read: false },
      { $set: { read: true } }
    );

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};


module.exports = { getUserForSidebar, getMessages, sendMessage,getRecentMessages,markMessagesRead};