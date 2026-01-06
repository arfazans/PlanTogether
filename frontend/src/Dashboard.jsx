import React, { useState, useContext, useEffect } from "react";
import Navbar from "./Navbar";
import Chatbot_Container from "./Chatbot_Container";
import chatboticon from "./assets/chat.png";
import ChatWindow from "./ChatWindow";
import GroupChatWindow from "./GroupChatWindow";
import aman from "./assets/aman.jpg";
import axios from "axios";
import { NoteContext } from "./ContextApi/CreateContext";

function Dashboard() {
  const URL = "http://localhost:9860";
  const [showchatbot, setshowchatbot] = useState(false);
  const [users, setUsers] = useState([]); // all users from DB
  const [groups, setGroups] = useState([]); // user's groups
  const [activeTab, setActiveTab] = useState('users'); // 'users' or 'groups'
  const [selectedGroupId, setSelectedGroupId] = useState(null);
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
    setSelectedGroupId(null); // Clear group selection
  };

  // Updates selected group ID when a group is clicked
  const handleGroupSelect = (groupId) => {
    setSelectedGroupId(groupId);
    setSelectedUserId(null); // Clear user selection
  };

  // Fetch all users except the logged-in user for the sidebar
  useEffect(() => {

    axios.get(`${URL}/message/users`, { withCredentials: true }).then((res) => {
      if (res.data.success) {
        setUsers(res.data.users);
      }
    });
  }, []);

  // Fetch user's groups
  useEffect(() => {
    axios.get(`${URL}/group/my-groups`, { withCredentials: true }).then((res) => {
      if (res.data.success) {
        setGroups(res.data.groups);
      }
    }).catch((error) => {
      console.error('Error fetching groups:', error);
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
          <div className="bg-[#232946] rounded-t-2xl h-full flex flex-col overflow-hidden">
            <div className="flex border-2 border-black rounded-t-2xl overflow-hidden flex-shrink-0">
              <button
                onClick={() => setActiveTab('users')}
                className={`flex-1 p-2 text-white font-bold transition-colors ${
                  activeTab === 'users' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                Users
              </button>
              <button
                onClick={() => setActiveTab('groups')}
                className={`flex-1 p-2 text-white font-bold transition-colors ${
                  activeTab === 'groups' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                Groups
              </button>
            </div>

            {/* Scrollable content area */}
            <div className="flex-1 overflow-y-auto p-2 space-y-2 scrollbar-hide">
            {activeTab === 'users' && users.map((user, index) => (
              <div
                key={index}
                onClick={() => handleUserSelect(user._id)}
                className={`cursor-pointer p-3 rounded-lg transition-all duration-300 ease-in-out flex items-center ${
        selectedUserId === user._id
          ? "bg-neutral-500 shadow-md shadow-gray-400/50"
          : "bg-neutral-700 hover:bg-neutral-600 hover:shadow-lg hover:shadow-gray-500/50 hover:scale-[1.02]"
      }`}
              >
                {/* Profile Image */}
                <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 mr-3">
                  <img
                    src={aman} // Replace with user.profilePic if available
                    alt="User Avatar"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Text Container */}
                <div className="flex-1 min-w-0">
                  {/* Name and Online Row */}
                  <div className="flex items-center space-x-2 mb-1">
                    <h1 className="text-white font-semibold text-sm truncate">
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
                      className={`text-gray-300 text-xs truncate flex-1 ${
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
            {activeTab === 'groups' && groups.map((group, index) => (
              <div
                key={index}
                onClick={() => handleGroupSelect(group._id)}
                className={`cursor-pointer p-3 rounded-lg transition-all duration-300 ease-in-out flex items-center ${
        selectedGroupId === group._id
          ? "bg-neutral-500 shadow-md shadow-gray-400/50"
          : "bg-neutral-700 hover:bg-neutral-600 hover:shadow-lg hover:shadow-gray-500/50 hover:scale-[1.02]"
      }`}
              >
                {/* Group Icon */}
                <div className="w-10 h-10 rounded-full flex-shrink-0 mr-3 bg-blue-500 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {group.name.charAt(0).toUpperCase()}
                  </span>
                </div>

                {/* Text Container */}
                <div className="flex-1 min-w-0">
                  {/* Group name */}
                  <div className="mb-1">
                    <h1 className="text-white font-semibold text-sm truncate">
                      {group.name}
                    </h1>
                  </div>

                  {/* Member count */}
                  <div>
                    <p className="text-gray-300 text-xs truncate">
                      {group.members.length} members
                    </p>
                  </div>
                </div>
              </div>
            ))}
            </div>
          </div>

          {/* Middle column - Chat or welcome message */}
          <div className="rounded-t-2xl bg-[#edf0f3] h-full overflow-hidden">
            {selectedUserId ? (
              <ChatWindow
                sendigToUsersId={selectedUserId}
                userid={userId}
                showChatbot={showchatbot}
                otherUserName={users.find(u => u._id === selectedUserId)?.name || 'User'}
              />
            ) : selectedGroupId ? (
              <GroupChatWindow
                groupId={selectedGroupId}
                userid={userId}
                groupName={groups.find(g => g._id === selectedGroupId)?.name || 'Group Chat'}
                memberCount={groups.find(g => g._id === selectedGroupId)?.members.length || 0}
                groupCreatorId={groups.find(g => g._id === selectedGroupId)?.createdBy || null}
                groupMembers = {groups.find(g=>g._id === selectedGroupId)?.members || []}
                showChatbot={showchatbot}
              />
            ) : (
              <div className="h-full flex items-center justify-center flex-col">
                <h2 className="text-2xl ">
                  Welcome To the chatNation || Where The talkative individuals
                  shine
                </h2>
                <p className="text-amber-50 ">
                  Begin Your Chat With your friends or groups
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
