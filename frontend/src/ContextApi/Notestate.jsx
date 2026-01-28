import { useRef, useState, useEffect } from "react";
import { connectWebSocket } from "../shared/services/websocketService";
import { NoteContext } from "./CreateContext";
import axios from "axios";
const NoteState = ({ children }) => {
  const socket = useRef(null);
  const [userId, setUserId] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);

  const [recentMessages, setRecentMessages] = useState({}); // New state to keep track of recent messages per user
  const [unreadUsers, setUnreadUsers] = useState({}); // Structure: { userId1: true, userId2: false, ...}

  // Function to update recent messages, key is user ID, value is last message text
  const updateRecentMessage = (userId, messageText) => {
    setRecentMessages((prev) => ({
      ...prev,
      [userId]: messageText,
    }));
  };

  // Fetch current user on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("http://localhost:9860/user/check-auth", {
          credentials: "include",
        });
        if (res.ok) {
          const user = await res.json();
          setUserId(user.userId || user._id);
        } else {
          setUserId(null);
        }
      } catch (err) {
        console.error("Failed to fetch user", err);
        setUserId(null);
      }
    };
    fetchUser();
  }, []);

  // Initialize socket only after userId is set (user logged in)
  useEffect(() => {
    if (!userId) {
      // If no user, disconnect existing socket if any
      if (socket.current) {
        socket.current.removeAllListeners(); // Remove all handlers before disconnecting
        socket.current.disconnect();
        socket.current = null;
        setOnlineUsers([]);
        setRecentMessages({});
      }
      return;
    }

    // Fetch recent messages for sidebar initial load
    const fetchRecentMessages = async () => {
      try {
        const res = await axios.get(
          "http://localhost:9860/message/recent-messages",
          {
            withCredentials: true,
          }
        );
        console.log(res);
        if (res.data.success) {
          setRecentMessages(res.data.recentMessages);
           // Add this line to set unreadUsers
      setUnreadUsers(res.data.unreadUsers || {});
        }
      } catch (error) {
        console.error("Failed to fetch recent messages", error);
      }
    };

    fetchRecentMessages();

    // Before creating a new socket, clean old socket safely if exists
    if (socket.current) {
      socket.current.removeAllListeners();
      socket.current.disconnect();
      socket.current = null;
    }

    // Connect socket for logged-in user
    socket.current = connectWebSocket();

    // Event listener: send user-online after socket connects
    const onConnect = () => {
      console.log("Socket connected", socket.current.id);
      socket.current.emit("user-online", userId);
    };

    // Handle online-user list updates from server
    const handleOnlineUsers = (users) => {
      console.log("Received online users:", users);
      setOnlineUsers(users);
    };

    socket.current.on("connect", onConnect);
    socket.current.on("online-user", handleOnlineUsers);

    const handleIncomingMessage = (data) => {
      console.log("Received socket message in context:", data);
      updateRecentMessage(data.senderId, data.text);
      updateRecentMessage(data.receiverId, data.text);

      // If current logged-in user is the receiver and chat window is NOT open for sender,
      // mark that senderId has unread messages
      if (data.receiverId === userId /* context's logged-in user id */) {
        // You will need currentOpenChatUserId from your UI state to compare
        if (data.senderId !== selectedUserId) {
          setUnreadUsers((prev) => ({ ...prev, [data.senderId]: true }));
        }
      }
    };
    socket.current.on("message", handleIncomingMessage);

    // Add "messages-read" listener here
    const handleMessagesRead = ({ receiverId }) => {
      setUnreadUsers((prev) => {
        const updated = { ...prev };
        delete updated[receiverId];
        return updated;
      });
    };
    socket.current.on("messages-read", handleMessagesRead);

    // Cleanup on userId change/disconnect
    return () => {
      if (socket.current) {
        socket.current.off("connect", onConnect);
        socket.current.off("online-user", handleOnlineUsers);
        socket.current.off("message", handleIncomingMessage);
        socket.current.off("messages-read", handleMessagesRead);
        socket.current.disconnect();
        socket.current = null;
      }
      setOnlineUsers([]);
      setRecentMessages({});
    };
  }, [userId]);

  // Mark messages as read when selecting a user
  useEffect(() => {
    if (selectedUserId && userId && socket.current) {
      // Clear unread status locally
      setUnreadUsers(prev => {
        const updated = { ...prev };
        delete updated[selectedUserId];
        return updated;
      });
      
      // Emit to server that messages are read
      socket.current.emit('mark-messages-read', {
        senderId: selectedUserId,
        receiverId: userId
      });
    }
  }, [selectedUserId, userId]);

  return (
    <NoteContext.Provider
      value={{
        socket,
        setUserId,
        userId,
        onlineUsers,
        recentMessages,
        updateRecentMessage,
        selectedUserId,
        setSelectedUserId,
        unreadUsers,
        setUnreadUsers,
      }}
    >
      {children}
    </NoteContext.Provider>
  );
};

export default NoteState;
