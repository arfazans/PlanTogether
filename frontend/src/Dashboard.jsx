import React, { useState, useContext, useEffect } from "react";
import Navbar from "./Navbar";
import Chatbot_Container from "./Chatbot_Container";
import chatboticon from "./assets/chat.png";
import ChatWindow from "./ChatWindow";
import aman from "./assets/aman.jpg";
import axios from "axios";
import { NoteContext } from "./ContextApi/CreateContext";

function Dashboard() {
  const URL = "http://localhost:9860";
  const [showchatbot, setshowchatbot] = useState(false);
  const [users, setUsers] = useState([]); // all users from DB
  const {
    recentMessages,
    userId,
    onlineUsers,
    unreadUsers,
    setSelectedUserId,
    selectedUserId,
  } = useContext(NoteContext);

  // Updates selected user ID when a user is clicked
  const handleUserSelect = (id) => {
    setSelectedUserId(id);
  };

  // Fetch all users except the logged-in user for the sidebar
  useEffect(() => {
    axios.get(`${URL}/message/users`, { withCredentials: true }).then((res) => {
      if (res.data.success) {
        setUsers(res.data.users);
      }
    });
  }, []);

  return (
    <div className="h-screen w-full flex flex-col bg-[#232946] relative">
      <Navbar />

      <main className="flex-1 overflow-hidden">
        <div
          className={`grid mt-14 w-full ${
            showchatbot
              ? "grid-cols-[15.625rem_1fr_21rem]"
              : "grid-cols-[15.625rem_1fr]"
          }`}
          style={{ height: "calc(100vh - 108px)" }}
        >
          {/* Left column - User sidebar */}
          <div className="bg-[#232946] rounded-t-2xl h-full flex flex-col">
            <div className="text-white text-center p-1 text-xl  font-extrabold border-2 border-black rounded-t-2xl">
              Users
            </div>
            {users.map((user, index) => (
              <div
                key={index}
                onClick={() => handleUserSelect(user._id)}
                className={`relative border-b-2 border-transparent pr-4 cursor-pointer p-2 m-2 rounded-lg transition-all duration-300 ease-in-out flex items-center
      ${
        selectedUserId === user._id
          ? "bg-neutral-500 shadow-md shadow-gray-400/50 border-gray-300"
          : "bg-neutral-700 hover:border-black hover:pr-0 hover:m-0 hover:shadow-lg hover:shadow-gray-500/50"
      }`}
              >
                {/* Profile Image */}
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 flex-shrink-0 mr-2">
                  <img
                    src={aman} // Replace with user.profilePic if available
                    alt="User Avatar"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Text Container */}
                <div className="flex-1 flex flex-col justify-center h-10">
                  {/* Name and Online Row */}
                  <div className="flex items-center justify-start space-x-2 mb-1">
                    <h1 className="text-white font-semibold text-base truncate">
                      {user.name}
                    </h1>
                    {/* Online indicator */}
                    {onlineUsers.includes(String(user._id)) && (
                      <span className="text-green-400 text-xs font-semibold">
                        online
                      </span>
                    )}
                  </div>

                  {/* Last message and unread dot row */}
                  <div className="flex items-center space-x-2">
                    <p
                      className={`text-gray-300 text-xs leading-tight truncate max-w-[140px] ${
                        unreadUsers[user._id] ? "font-bold text-white" : ""
                      }`}
                    >
                      {recentMessages[user._id] || "No messages yet"}
                    </p>

                    {unreadUsers[user._id] && (
                      <span className="w-2 h-2 rounded-full bg-white flex-shrink-0"></span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Middle column - Chat or welcome message */}
          <div className="rounded-t-2xl bg-[#edf0f3] h-full overflow-hidden">
            {selectedUserId ? (
              <ChatWindow
                sendigToUsersId={selectedUserId}
                userid={userId}
                showChatbot={showchatbot}
              />
            ) : (
              <div className="h-full flex items-center justify-center flex-col">
                <h2 className="text-2xl ">
                  Welcome To the chatNation || Where The talkative individuals
                  shine
                </h2>
                <p className="text-amber-50 ">
                  Begin Your Chat With your friends
                </p>
              </div>
            )}
          </div>

          {/* Right column - Chatbot */}
          {showchatbot ? (
            <div className="bg-[#232946] rounded-t-2xl h-full">
              <Chatbot_Container onClose={() => setshowchatbot(false)} />
            </div>
          ) : (
            <img
              onClick={() => setshowchatbot(true)}
              className="absolute w-12 bottom-6 right-6 cursor-pointer h-auto"
              src={chatboticon}
              alt="chatbot"
            />
          )}
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
