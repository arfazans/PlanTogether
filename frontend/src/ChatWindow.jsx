import React, { useState, useRef, useEffect, useContext } from "react";
import { Send } from "lucide-react";
import { NoteContext } from "./ContextApi/CreateContext";
import axios from "axios";

//showChatbot is for the right side bot window to maintain the design of the send button of middle send button in dashboard
const ChatWindow = ({ showChatbot, userid, sendigToUsersId, otherUserName }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const [isTyping, setIsTyping] = useState(false);

  const { socket, updateRecentMessage, setUnreadUsers, unreadUsers } =
    useContext(NoteContext);

  // 🔹 Scroll to bottom when new messages come
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 🔹 Fetch messages whenever the selected user changes
  useEffect(() => {
    if (!sendigToUsersId) return;

    const fetchMessages = async () => {
      try {
        const res = await axios.get(
          `http://localhost:9860/message/${sendigToUsersId}`,
          { withCredentials: true }
        );
        if (res.data.success) {
          setMessages(res.data.messages);
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();
  }, [sendigToUsersId]);

  // 🔹 Listen for incoming messages in real-time
  useEffect(() => {
    if (!socket.current) return;

    const handleIncomingMessage = (data) => {
      // Only show message if it’s from or to this user
      if (
        (data.senderId === userid && data.receiverId === sendigToUsersId) ||
        (data.senderId === sendigToUsersId && data.receiverId === userid)
      ) {
        setMessages((prev) => [...prev, data]);
        // Update recent message for the conversation partner
        const otherUserId =
          data.senderId === userid ? data.receiverId : data.senderId;
        updateRecentMessage(otherUserId, data.text);
      }
    };

    socket.current.on("message", handleIncomingMessage);
    return () => {
      socket.current.off("message", handleIncomingMessage);
    };
  }, [userid, sendigToUsersId, socket, updateRecentMessage]);

  // 🔹 Send message
  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const msg = {
      text: newMessage.trim(),
    };

    try {
      // 1️⃣ Save message in DB
      const res = await axios.post(
        `http://localhost:9860/message/send/${sendigToUsersId}`,
        msg,
        { withCredentials: true }
      );

      if (res.data.success) {
        const savedMessage = res.data.message;

        // 2️⃣ Emit real-time message
        socket.current.emit("message", savedMessage);

        // 3️⃣ Update UI instantly
        setMessages((prev) => [...prev, savedMessage]);

        //for update sender sidebar recent message
        updateRecentMessage(sendigToUsersId, savedMessage.text);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }

    setNewMessage("");
  };

  // 🔹 Enter key sends message
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  //For mark read to true for seen message
  useEffect(() => {
    if (!sendigToUsersId) return;

    // Immediately clear the unread indicator locally
    setUnreadUsers((prev) => {
      if (!(sendigToUsersId in prev)) return prev; // no change if already cleared
      const updated = { ...prev };
      delete updated[sendigToUsersId];
      return updated;
    });

    // Call backend and emit read event as before
    const markRead = async () => {
      try {
        await axios.post(
          `http://localhost:9860/message/read/${sendigToUsersId}`,
          {},
          { withCredentials: true }
        );

        if (socket.current) {
          socket.current.emit("read", {
            senderId: sendigToUsersId,
            receiverId: userid,
          });
        }
      } catch (error) {
        console.error("Error marking messages as read:", error);
      }
    };

    markRead();
  }, [sendigToUsersId, userid, socket, setUnreadUsers]);

  //tping indicator Event
  const handleTyping = () => {
    if (!socket.current) return;
    socket.current.emit("typing", { to: sendigToUsersId, from: userid });
    // Reset the timer on each keystroke
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.current.emit("stopTyping", { to: sendigToUsersId, from: userid });
    }, 1500); // stops typing after 1.5s inactivity
  };

  useEffect(() => {
    if (!socket.current) return;

    const handleTyping = ({ from }) => {
      if (from === sendigToUsersId) setIsTyping(true);
    };
    const handleStopTyping = ({ from }) => {
      if (from === sendigToUsersId) setIsTyping(false);
    };

    socket.current.on("typing", handleTyping);
    socket.current.on("stopTyping", handleStopTyping);

    // Safety: remove the indicator when chat changes
    return () => {
      setIsTyping(false);
      socket.current.off("typing", handleTyping);
      socket.current.off("stopTyping", handleStopTyping);
    };
  }, [sendigToUsersId, socket]);

  return (
    <div className="flex flex-col h-full w-full bg-[#edf0f3] border border-gray-300">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 px-4 py-2 border-b border-gray-300 bg-white shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-800">
            {otherUserName || 'User'}
          </h3>
        </div>
      </div>

      {/* Messages */}
      <div className="flex flex-col flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`max-w-[60%] px-[14px] py-[10px] rounded-2xl text-[15px] break-words backdrop-blur-md
    flex ${
      message.senderId === userid
      ? "self-end bg-[#5B50A7] text-black justify-end"
      : "self-start bg-[#CFD8DC] text-black justify-start"

    }`}
          >
            {message.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {isTyping && (
        <div className="self-start px-3 py-2 ml-4 mb-5 bg-gray-200 rounded-2xl max-w-max shadow flex items-center gap-1">
          <span className="block w-2 h-2 bg-gray-500 rounded-full animate-pulse" />
          <span className="block w-2 h-2 bg-gray-500 rounded-full animate-pulse delay-150" />
          <span className="block w-2 h-2 bg-gray-500 rounded-full animate-pulse delay-300" />
        </div>
      )}

      {/* Input */}
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
            placeholder="Message..."
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

export default ChatWindow;
