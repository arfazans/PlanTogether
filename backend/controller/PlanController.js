const Plan = require("../model/PlanModel");
const Message = require("../model/MessageModel");
const Group = require("../model/GroupModel");

// Create plan manually (from form)
const createPlanManually = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { eventName, dateTime, location, budget } = req.body;
    const userId = req.user.userId;

    // Check if user is group creator
    const group = await Group.findById(groupId);
    if (!group || !group.members.includes(userId)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    if (group.createdBy.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Only group creator can create plans",
      });
    }

    // Check if plan already exists and update it, or create new one
    let plan = await Plan.findOne({ groupId });
    let isNewPlan = !plan;

    if (plan) {
      // Update existing plan
      plan.eventName = eventName;
      plan.dateTime = dateTime;
      plan.location = location;
      plan.budget = budget;
      plan.status = "draft";
      await plan.save();
    } else {
      // Create new plan
      plan = new Plan({
        groupId,
        eventName,
        dateTime,
        location,
        budget,
        attendees: [],
        status: "draft",
        createdBy: userId,
      });
      await plan.save();
    }

    // Create poll message for both new and updated plans
    console.log("Creating poll message for plan:", plan._id);

    const pollMessage = new Message({
      senderId: userId,
      groupId,
      messageType: "poll",
      text: `Plan Poll: ${plan.eventName}`,
      pollData: {
        planId: plan._id,
        question: `Who's joining "${plan.eventName}"?`,
        options: [
          { text: "I'm in!", votes: [] },
          { text: "Can't make it", votes: [] },
        ],
      },
    });
    await pollMessage.save();
    await pollMessage.populate("senderId", "name");
    console.log("Poll message created:", pollMessage._id);
    // link current plan to this poll
    plan.pollMessageId = pollMessage._id;
    await plan.save();

    await plan.populate("createdBy", "name");

    res.json({
      success: true,
      plan,
      pollMessage,
    });
  } catch (error) {
    console.error("Create plan manually error:", error);
    res.status(500).json({ success: false, message: "Failed to create plan" });
  }
};

// Get current plan for group
const getGroupPlan = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.userId;

    // Check access
    const group = await Group.findById(groupId);
    if (!group || !group.members.includes(userId)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const plan = await Plan.findOne({ groupId })
      .populate("createdBy", "name")
      .populate("attendees", "name")
      .sort({ createdAt: -1 });

    res.json({ success: true, plan });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update plan
const updatePlan = async (req, res) => {
  try {
    const { planId } = req.params;
    const { eventName, dateTime, location, budget, status } = req.body;
    const userId = req.user.userId;

    const plan = await Plan.findById(planId).populate("groupId");
    if (!plan) {
      return res
        .status(404)
        .json({ success: false, message: "Plan not found" });
    }

    // Check if user is group creator
    if (plan.groupId.createdBy.toString() !== userId) {
      return res
        .status(403)
        .json({ success: false, message: "Only group creator can edit plans" });
    }

    // Delete old poll message if it exists
    if (plan.pollMessageId) {
      await Message.findByIdAndDelete(plan.pollMessageId);
    }

    // Update fields only if provided
    if (eventName !== undefined) plan.eventName = eventName;
    if (dateTime !== undefined && dateTime !== null && dateTime !== "") {
      plan.dateTime = new Date(dateTime);
    }
    if (location !== undefined) plan.location = location;
    if (budget !== undefined) plan.budget = budget;
    if (status !== undefined) plan.status = status;
    
    // Reset attendees when plan is updated
    plan.attendees = [];

    await plan.save();

    // Create new poll message
    const pollMessage = new Message({
      senderId: userId,
      groupId: plan.groupId._id,
      messageType: "poll",
      text: `Plan Poll: ${plan.eventName}`,
      pollData: {
        planId: plan._id,
        question: `Who's joining "${plan.eventName}"?`,
        options: [
          { text: "I'm in!", votes: [] },
          { text: "Can't make it", votes: [] },
        ],
      },
    });
    await pollMessage.save();
    await pollMessage.populate("senderId", "name");

    // Link new poll to plan
    plan.pollMessageId = pollMessage._id;
    await plan.save();
    await plan.populate("createdBy attendees", "name");

    res.json({ success: true, plan, pollMessage });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete plan
const deletePlan = async (req, res) => {
  try {
    const { planId } = req.params;
    const userId = req.user.userId;

    const plan = await Plan.findById(planId).populate("groupId");
    if (!plan) {
      return res
        .status(404)
        .json({ success: false, message: "Plan not found" });
    }

    // Check if user is group creator
    if (plan.groupId.createdBy.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Only group creator can delete plans",
      });
    }

    // Delete associated poll message
    if (plan.pollMessageId) {
      await Message.findByIdAndDelete(plan.pollMessageId);
    }

    await Plan.findByIdAndDelete(planId);

    res.json({ success: true, message: "Plan deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Vote on poll
const voteOnPoll = async (req, res) => {
  try {
    const { planId } = req.params;
    const { optionIndex } = req.body;
    const userId = req.user.userId;

    // Find the poll message
    const pollMessage = await Message.findOne({
      messageType: "poll",
      "pollData.planId": planId,
    });

    if (!pollMessage) {
      return res
        .status(404)
        .json({ success: false, message: "Poll not found" });
    }

    // Remove user from all options first
    pollMessage.pollData.options.forEach((option) => {
      option.votes = option.votes.filter((vote) => vote.toString() !== userId);
    });

    // Add user to selected option
    if (optionIndex >= 0 && optionIndex < pollMessage.pollData.options.length) {
      pollMessage.pollData.options[optionIndex].votes.push(userId);
    }

    await pollMessage.save();
    await pollMessage.populate("senderId", "name");
    await pollMessage.populate("pollData.options.votes", "name");

    // Update plan attendees based on "I'm in" votes
    const plan = await Plan.findById(planId);
    if (plan) {
      plan.attendees = pollMessage.pollData.options[0].votes; // First option is "I'm in"
      await plan.save();
      await plan.populate("createdBy attendees", "name");
    }

    res.json({ success: true, pollMessage, plan });
  } catch (error) {
    console.error("Vote on poll error:", error);
    res.status(500).json({ success: false, message: "Failed to vote" });
  }
};

module.exports = {
  createPlanManually,
  voteOnPoll,
  getGroupPlan,
  updatePlan,
  deletePlan,
};
