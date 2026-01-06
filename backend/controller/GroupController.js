const Group = require('../model/GroupModel');
const Message = require('../model/MessageModel');

// Generate random invite code
const generateInviteCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

// Create a new group
const createGroup = async (req, res) => {
  try {
    const { name, description } = req.body;
    const createdBy = req.user.userId;
    
    // Generate unique invite code
    let inviteCode;
    let isUnique = false;
    
    while (!isUnique) {
      inviteCode = generateInviteCode();
      const existingGroup = await Group.findOne({ inviteCode });
      if (!existingGroup) {
        isUnique = true;
      }
    }
    
    const group = new Group({
      name,
      description,
      createdBy,
      members: [createdBy], // Creator is automatically a member
      inviteCode
    });
    
    await group.save();
    await group.populate('members', 'name email');
    
    res.json({ 
      success: true, 
      group,
      message: 'Group created successfully' 
    });
  } catch (error) {
    console.error('Create group error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Join group by invite code
const joinGroup = async (req, res) => {
  try {
    const { inviteCode } = req.body;
    const userId = req.user.userId;
    
    const group = await Group.findOne({ inviteCode });
    if (!group) {
      return res.status(404).json({ 
        success: false, 
        message: 'Invalid invite code' 
      });
    }
    
    // Check if user is already a member
    if (group.members.includes(userId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'You are already a member of this group' 
      });
    }
    
    // Add user to group
    group.members.push(userId);
    await group.save();
    await group.populate('members', 'name email');
    
    res.json({ 
      success: true, 
      group,
      message: 'Successfully joined the group' 
    });
  } catch (error) {
    console.error('Join group error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Get user's groups
const getUserGroups = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const groups = await Group.find({ 
      members: userId 
    }).populate('members', 'name email')
      .populate('createdBy', 'name email')
      .sort({ updatedAt: -1 });
    
    res.json({ 
      success: true, 
      groups 
    });
  } catch (error) {
    console.error('Get groups error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Get all groups (for groups page)
const getAllGroups = async (req, res) => {
  try {
    const groups = await Group.find({})
      .populate('members', 'name email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: 1 });
    
    res.json({ 
      success: true, 
      groups 
    });
  } catch (error) {
    console.error('Get all groups error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Get group messages
const getGroupMessages = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.userId;
    
    // Check if user is member of the group
    const group = await Group.findById(groupId);
    if (!group || !group.members.includes(userId)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied' 
      });
    }
    
    const messages = await Message.find({ 
      groupId,
      messageType: { $in: ['group', 'poll'] }
    }).populate('senderId', 'name email')
      .sort({ createdAt: 1 })
      .limit(100); // Limit to last 100 messages
    
    res.json({ 
      success: true, 
      messages 
    });
  } catch (error) {
    console.error('Get group messages error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Send group message
const sendGroupMessage = async (req, res) => {
  try {
    const { text, groupId } = req.body;
    const senderId = req.user.userId;
    
    // Check if user is member of the group
    const group = await Group.findById(groupId);
    if (!group || !group.members.includes(senderId)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied' 
      });
    }
    
    const message = new Message({
      senderId,
      groupId,
      messageType: 'group',
      text
    });
    
    await message.save();
    await message.populate('senderId', 'name email');
    
    res.json({ 
      success: true, 
      message 
    });
  } catch (error) {
    console.error('Send group message error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

module.exports = {
  createGroup,
  joinGroup,
  getUserGroups,
  getAllGroups,
  getGroupMessages,
  sendGroupMessage
};