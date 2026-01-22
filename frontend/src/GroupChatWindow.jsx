import React, { useState, useRef, useEffect, useContext } from "react";
import { Send } from "lucide-react";
import axios from "axios";
import { NoteContext } from "./ContextApi/CreateContext";
import PollMessage from "./PollMessage";

const EditPlanForm = ({ plan, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    eventName: plan.eventName || "",
    dateTime: plan.dateTime
      ? new Date(plan.dateTime).toISOString().slice(0, 16)
      : "",
    location: plan.location || "",
    budget: plan.budget || "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      dateTime: formData.dateTime ? new Date(formData.dateTime) : null,
      budget: formData.budget ? Number(formData.budget) : null,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="mt-2 space-y-2">
      <input
        type="text"
        placeholder="Event name"
        value={formData.eventName}
        onChange={(e) =>
          setFormData({ ...formData, eventName: e.target.value })
        }
        className="w-full px-2 py-1 text-xs border rounded"
      />
      <input
        type="datetime-local"
        value={formData.dateTime}
        onChange={(e) => setFormData({ ...formData, dateTime: e.target.value })}
        className="w-full px-2 py-1 text-xs border rounded"
      />
      <input
        type="text"
        placeholder="Location"
        value={formData.location}
        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
        className="w-full px-2 py-1 text-xs border rounded"
      />
      <input
        type="number"
        placeholder="Budget (₹)"
        value={formData.budget}
        onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
        className="w-full px-2 py-1 text-xs border rounded"
      />
      <div className="flex gap-2">
        <button
          type="submit"
          className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
        >
          Save
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

const GroupChatWindow = ({
  showChatbot,
  userid,
  groupId,
  groupName,
  memberCount,
  groupCreatorId,
  groupMembers,
}) => {
  const { socket, onlineUsers } = useContext(NoteContext);

  // Helper function to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString('en-US', { month: 'short' });
    const year = date.getFullYear();
    const time = date.toLocaleString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: true 
    });
    
    const suffix = day === 1 || day === 21 || day === 31 ? 'st' :
                   day === 2 || day === 22 ? 'nd' :
                   day === 3 || day === 23 ? 'rd' : 'th';
    
    return `${day}${suffix} ${month}. ${year} ${time}`;
  };

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [currentPlan, setCurrentPlan] = useState(null);
  const [creatingPlan, setCreatingPlan] = useState(false);
  const [editingPlan, setEditingPlan] = useState(false);
  const [planError, setPlanError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [planCollapsed, setPlanCollapsed] = useState(false);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const messageRefs = useRef({});
  const [focusedMessageId, setFocusedMessageId] = useState(null);

  const onlineGroupMembers = groupMembers.filter((member) =>
    onlineUsers.includes(String(member._id))
  );
  const onlineCount = onlineGroupMembers.length;

  const handlePollVoteUpdate = (updatedPollMessage, updatedPlan) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg._id === updatedPollMessage._id ? updatedPollMessage : msg
      )
    );
    if (updatedPlan) {
      const prevAttendeeCount = currentPlan?.attendees?.length || 0;
      const newAttendeeCount = updatedPlan?.attendees?.length || 0;
      
      setCurrentPlan(updatedPlan);
      
      // Auto-expand plan when attendees change
      if (newAttendeeCount !== prevAttendeeCount) {
        setPlanCollapsed(false);
      }
      
      // Emit both plan and poll message updates to other users for real-time sync
      socket.current.emit("plan-updated", { 
        groupId, 
        plan: updatedPlan, 
        pollMessage: updatedPollMessage 
      });
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // initial fetch
  useEffect(() => {
    if (!groupId) return;

    const fetchMessages = async () => {
      try {
        const res = await axios.get(
          `http://localhost:9860/group/${groupId}/messages`,
          { withCredentials: true }
        );
        if (res.data.success) {
          setMessages(res.data.messages);
        }
      } catch (error) {
        console.error("Error fetching group messages:", error);
      }
    };

    const fetchPlan = async () => {
      try {
        const res = await axios.get(
          `http://localhost:9860/plan/groups/${groupId}/plan`,
          { withCredentials: true }
        );
        if (res.data.success && res.data.plan) {
          setCurrentPlan(res.data.plan);
          // Keep plan expanded when loaded from server
          setPlanCollapsed(false);
        } else {
          setCurrentPlan(null);
        }
      } catch (error) {
        console.error("Error fetching group plan:", error);
      }
    };

    // Reset messages when switching groups
    setMessages([]);
    fetchMessages();
    fetchPlan();
  }, [groupId]);

  // typing + generic plan events
  useEffect(() => {
    if (!socket.current || !groupId) return;

    socket.current.emit("join-group", groupId);

    const handleGroupTyping = ({ from, userName }) => {
      if (from !== userid) {
        setTypingUsers((prev) => new Set([...prev, userName]));
      }
    };

    const handleGroupStopTyping = ({ from, userName }) => {
      if (from !== userid) {
        setTypingUsers((prev) => {
          const next = new Set(prev);
          next.delete(userName);
          return next;
        });
      }
    };

    const handlePlanError = (data) => {
      setCreatingPlan(false);
      setPlanError(data.message);
    };

    const handlePlanUpdated = (data) => {
      if (data.groupId === groupId) {
        // Remove old poll message if it exists
        if (data.oldPollMessageId) {
          setMessages((prev) => prev.filter(msg => msg._id !== data.oldPollMessageId));
        }
        
        // Update poll message if provided (for vote updates)
        if (data.pollMessage) {
          setMessages((prev) =>
            prev.map((msg) =>
              msg._id === data.pollMessage._id ? data.pollMessage : msg
            )
          );
        }
        
        const prevAttendeeCount = currentPlan?.attendees?.length || 0;
        const newAttendeeCount = data.plan?.attendees?.length || 0;
        
        setCurrentPlan(data.plan);
        
        // Auto-expand plan when attendees change for real-time updates
        if (newAttendeeCount !== prevAttendeeCount) {
          setPlanCollapsed(false);
        }
      }
    };

    const handlePlanCompleted = (data) => {
      if (data.groupId === groupId) {
        setCurrentPlan(data.plan);
        setPlanError(null);
      }
    };

    socket.current.on("group-typing", handleGroupTyping);
    socket.current.on("group-stop-typing", handleGroupStopTyping);
    socket.current.on("plan-error", handlePlanError);
    socket.current.on("plan-updated", handlePlanUpdated);
    socket.current.on("plan-completed", handlePlanCompleted);

    return () => {
      socket.current.emit("leave-group", groupId);
      socket.current.off("group-typing", handleGroupTyping);
      socket.current.off("group-stop-typing", handleGroupStopTyping);
      socket.current.off("plan-error", handlePlanError);
      socket.current.off("plan-updated", handlePlanUpdated);
      socket.current.off("plan-completed", handlePlanCompleted);
      setTypingUsers(new Set());
    };
  }, [groupId, socket, userid]);

  // group messages
  useEffect(() => {
    if (!socket.current) return;

    const handleIncomingGroupMessage = (msg) => {
      setMessages((prev) => [...prev, msg]);
    };

    socket.current.on("group-message", handleIncomingGroupMessage);

    return () => {
      socket.current.off("group-message", handleIncomingGroupMessage);
    };
  }, []);

  // plan created / deleted
  useEffect(() => {
    if (!socket.current) return;

    const handlePlanCreated = ({ groupId: gid, plan, pollMessage }) => {
      if (gid !== groupId) return;
      setCurrentPlan(plan);
      // Keep plan expanded when created
      setPlanCollapsed(false);
    };

    const handlePlanDeleted = ({ groupId: gid, planId, pollMessageId }) => {
      if (gid !== groupId) return;
      
      // Remove poll message if it exists
      if (pollMessageId) {
        setMessages((prev) => prev.filter(msg => msg._id !== pollMessageId));
      }
      
      setCurrentPlan((prev) => (prev && prev._id === planId ? null : prev));
    };

    socket.current.on("plan-created", handlePlanCreated);
    socket.current.on("plan-deleted", handlePlanDeleted);

    return () => {
      socket.current.off("plan-created", handlePlanCreated);
      socket.current.off("plan-deleted", handlePlanDeleted);
    };
  }, [groupId]);

  useEffect(() => {
    if (!focusedMessageId) return;
    const el = messageRefs.current[focusedMessageId];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [focusedMessageId]);

  const handleViewPoll = () => {
    if (!currentPlan?.pollMessageId) return;
    
    // First try to scroll to existing poll message
    const pollElement = messageRefs.current[currentPlan.pollMessageId];
    if (pollElement) {
      pollElement.scrollIntoView({ behavior: "smooth", block: "center" });
      setFocusedMessageId(currentPlan.pollMessageId);
    } else {
      // If poll message not found in DOM, wait a bit and try again
      setTimeout(() => {
        const retryElement = messageRefs.current[currentPlan.pollMessageId];
        if (retryElement) {
          retryElement.scrollIntoView({ behavior: "smooth", block: "center" });
          setFocusedMessageId(currentPlan.pollMessageId);
        }
      }, 100);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const msg = {
      text: newMessage.trim(),
      groupId,
      messageType: "group",
    };

    try {
      const res = await axios.post(
        `http://localhost:9860/group/send-message`,
        msg,
        { withCredentials: true }
      );

      if (res.data.success) {
        const savedMessage = res.data.message;
        socket.current.emit("group-message", savedMessage);
      }
    } catch (error) {
      console.error("Error sending group message:", error);
    }

    setNewMessage("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleTyping = () => {
    if (!socket.current) return;

    const currentUserName =
      messages.find((msg) => msg.senderId._id === userid)?.senderId.name ||
      "You";

    socket.current.emit("group-typing", {
      groupId,
      from: userid,
      userName: currentUserName,
    });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.current.emit("group-stop-typing", {
        groupId,
        from: userid,
        userName: currentUserName,
      });
    }, 1500);
  };

  const handleCreatePlan = () => {
    if (currentPlan) setEditingPlan(true);
    else setShowCreateForm(true);
    setPlanError(null);
  };

  const handleSaveInlinePlan = async (planData) => {
    try {
      setCreatingPlan(true);
      setPlanError(null);

      const res = await axios.post(
        `http://localhost:9860/plan/groups/${groupId}/plan`,
        planData,
        { withCredentials: true }
      );

      if (res.data.success) {
        setCurrentPlan(res.data.plan);
        setShowCreateForm(false);
        setEditingPlan(false);
        // Keep plan expanded when created
        setPlanCollapsed(false);

        if (res.data.pollMessage) {
          socket.current.emit("group-message", res.data.pollMessage);
        }

        socket.current.emit("plan-created", {
          groupId,
          plan: res.data.plan,
          pollMessage: res.data.pollMessage,
        });
      }
    } catch (error) {
      setPlanError("Failed to create plan");
    } finally {
      setCreatingPlan(false);
    }
  };

  const handleCancelInlineForm = () => {
    setShowCreateForm(false);
  };

  const handleDeletePlan = async () => {
    if (!currentPlan || !window.confirm("Delete this plan?")) return;

    try {
      const res = await axios.delete(
        `http://localhost:9860/plan/plan/${currentPlan._id}`,
        { withCredentials: true }
      );

      if (res.data.success) {
        // Remove poll message from messages if it exists
        if (currentPlan.pollMessageId) {
          setMessages((prev) => prev.filter(msg => msg._id !== currentPlan.pollMessageId));
        }
        
        setCurrentPlan(null);
        socket.current.emit("plan-deleted", {
          groupId,
          planId: currentPlan._id,
          pollMessageId: currentPlan.pollMessageId
        });
      }
    } catch (error) {
      setPlanError("Failed to delete plan");
    }
  };

  const handleEditPlan = () => setEditingPlan(true);

  const handleSavePlan = async (updatedPlan) => {
    try {
      const res = await axios.put(
        `http://localhost:9860/plan/plan/${currentPlan._id}`,
        updatedPlan,
        { withCredentials: true }
      );

      if (res.data.success) {
        // Remove old poll message if it exists
        if (currentPlan.pollMessageId) {
          setMessages((prev) => prev.filter(msg => msg._id !== currentPlan.pollMessageId));
        }
        
        setCurrentPlan(res.data.plan);
        setEditingPlan(false);
        
        // Add new poll message if it exists
        if (res.data.pollMessage) {
          socket.current.emit("group-message", res.data.pollMessage);
        }
        
        socket.current.emit("plan-updated", { 
          groupId, 
          plan: res.data.plan,
          pollMessage: res.data.pollMessage,
          oldPollMessageId: currentPlan.pollMessageId
        });
      }
    } catch (error) {
      setPlanError("Failed to update plan");
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#edf0f3] border border-gray-300">
      {/* header */}
      <div className="sticky top-0 z-10 px-4 py-2 border-b border-gray-300 bg-white shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-gray-800">
              {groupName}
            </h3>
            <p className="text-xs text-gray-500">
              {memberCount} members |{" "}
              <span className="text-green-400 font-semibold">
                {onlineCount} online
              </span>
            </p>
          </div>

          {groupCreatorId._id === userid && (
            <button
              onClick={handleCreatePlan}
              disabled={creatingPlan}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              {creatingPlan
                ? "Saving..."
                : currentPlan
                ? "Edit Plan"
                : "Create Plan"}
            </button>
          )}
        </div>

        {planError && (
          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-red-700 text-xs">Error: {planError}</span>
              <button
                onClick={() => setPlanError(null)}
                className="text-red-500 hover:text-red-700"
              >
                X
              </button>
            </div>
          </div>
        )}

        {(currentPlan || showCreateForm) && (
          <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
            {showCreateForm ? (
              <div>
                <h4 className="font-medium text-blue-900 text-sm mb-2">
                  Create New Plan
                </h4>
                <EditPlanForm
                  plan={{
                    eventName: "",
                    dateTime: "",
                    location: "",
                    budget: "",
                  }}
                  onSave={handleSaveInlinePlan}
                  onCancel={handleCancelInlineForm}
                />
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-blue-900 text-sm">
                    {currentPlan.eventName || "Event Plan"}
                  </h4>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPlanCollapsed(!planCollapsed)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      {planCollapsed ? "▼" : "▲"}
                    </button>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {currentPlan.status}
                    </span>
                    {currentPlan.createdBy._id === userid && (
                      <div className="flex gap-1">
                        <button
                          onClick={handleEditPlan}
                          className="text-blue-600 hover:text-blue-800 text-xs"
                        >
                          Edit
                        </button>
                        <button
                          onClick={handleDeletePlan}
                          className="text-red-600 hover:text-red-800 text-xs"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {editingPlan ? (
                  <EditPlanForm
                    plan={currentPlan}
                    onSave={handleSavePlan}
                    onCancel={() => setEditingPlan(false)}
                  />
                ) : (
                  !planCollapsed && (
                  <div className="mt-1 text-xs text-blue-700 space-y-1">
                    {currentPlan.dateTime && (
                      <div>
                        Time: {formatDate(currentPlan.dateTime)}
                      </div>
                    )}
                    {currentPlan.location && (
                      <div>Location: {currentPlan.location}</div>
                    )}
                    {currentPlan.budget && <div>Budget: ₹{currentPlan.budget}</div>}
                    
                    {/* Attendees section - always show */}
                    <div className="mt-2">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-green-600 font-medium">
                          Attendees ({currentPlan.attendees?.length || 0}):
                        </span>
                        {currentPlan?.pollMessageId && (
                          <button
                            onClick={handleViewPoll}
                            className="text-xs text-blue-700 underline"
                          >
                            View poll
                          </button>
                        )}
                      </div>
                      {currentPlan.attendees && currentPlan.attendees.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {currentPlan.attendees.map((attendee, index) => (
                            <span
                              key={index}
                              className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs"
                            >
                              {typeof attendee === "string"
                                ? attendee
                                : attendee.name}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <div className="text-gray-500 text-xs italic">
                          No attendees yet
                        </div>
                      )}
                    </div>

                    {(!currentPlan.dateTime ||
                      !currentPlan.location ||
                      !currentPlan.budget) && (
                      <div className="text-yellow-600 text-xs mt-1">
                        Some details missing - click Edit Plan to complete
                      </div>
                    )}
                  </div>
                  )
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* messages */}
      <div className="flex flex-col flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => {
          const isPoll = message.messageType === "poll";
          const isCurrentPoll =
            isPoll && currentPlan && currentPlan.pollMessageId === message._id;

          return isPoll ? (
            <div
              key={message._id || index}
              ref={(el) => {
                if (el) messageRefs.current[message._id] = el;
              }}
              className={`flex justify-center ${
                isCurrentPoll ? "ring-2 ring-blue-400 rounded-xl" : ""
              }`}
            >
              <PollMessage
                message={message}
                userid={userid}
                onVoteUpdate={handlePollVoteUpdate}
                isCurrentPoll={isCurrentPoll}
              />
            </div>
          ) : (
            <div
              key={message._id || index}
              ref={(el) => {
                if (el) messageRefs.current[message._id] = el;
              }}
              className={`max-w-[60%] px-[14px] py-[10px] rounded-2xl text-[15px] break-words backdrop-blur-md flex flex-col ${
                message.senderId._id === userid
                  ? "self-end bg-[#5B50A7] text-white"
                  : "self-start bg-[#CFD8DC] text-black"
              }`}
            >
              {message.senderId._id !== userid && (
                <div className="text-xs font-semibold mb-1 text-gray-600">
                  {message.senderId.name}
                </div>
              )}
              <div>{message.text}</div>
            </div>
          );
        })}

        <div ref={messagesEndRef} />
      </div>

      {/* typing indicator */}
      {typingUsers.size > 0 && (
        <div className="self-start px-3 py-2 ml-4 mb-5 bg-gray-200 rounded-2xl max-w-max shadow flex items-center gap-2">
          <div className="flex items-center gap-1">
            <span className="block w-2 h-2 bg-gray-500 rounded-full animate-pulse" />
            <span className="block w-2 h-2 bg-gray-500 rounded-full animate-pulse delay-150" />
            <span className="block w-2 h-2 bg-gray-500 rounded-full animate-pulse delay-300" />
          </div>
          <span className="text-xs text-gray-600">
            {Array.from(typingUsers).join(", ")}{" "}
            {typingUsers.size === 1 ? "is" : "are"} typing...
          </span>
        </div>
      )}

      {/* input */}
      <div
        className={`p-4 border-t border-gray-300 bg-transparent ${
          showChatbot ? "p-4" : "pr-24 pb-6"
        }`}
      >
        <div className="flex items-center w-full space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              handleTyping();
            }}
            onKeyPress={handleKeyPress}
            placeholder="Message to group..."
            className="flex-1 w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ minWidth: "2.5rem" }}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupChatWindow;
