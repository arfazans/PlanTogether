import React, { useState, useContext, useEffect } from "react";
import Navbar from "./Navbar";
import Chatbot_Container from "./Chatbot_Container";
import CleanChatbot from "./CleanChatbot";
import chatboticon from "./assets/chat.png";
import ChatWindow from "./ChatWindow";
import GroupChatWindow from "./GroupChatWindow";
import aman from "./assets/aman.jpg";
import axios from "axios";
import { NoteContext } from "./ContextApi/CreateContext";
import Posts from "./Posts";

function Dashboard() {
  const URL = "http://localhost:9860";
  const [showchatbot, setshowchatbot] = useState(false);
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [activeTab, setActiveTab] = useState('users');
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [showMobileMessages, setShowMobileMessages] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);
  const {
    recentMessages,
    userId,
    onlineUsers,
    unreadUsers,
    setSelectedUserId,
    selectedUserId,
  } = useContext(NoteContext);

  const handleChatbotSelect = () => {
    setActiveTab('chatbot');
  };

  const handleUserSelect = (id) => {
    setSelectedUserId(id);
    setSelectedGroupId(null);
    setShowMobileMessages(false);
  };

  const handleGroupSelect = (groupId) => {
    setSelectedGroupId(groupId);
    setSelectedUserId(null);
    setShowMobileMessages(false);
  };

  useEffect(() => {
    axios.get(`${URL}/message/users`, { withCredentials: true }).then((res) => {
      if (res.data.success) {
        setUsers(res.data.users);
      }
    });
  }, []);

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
      <Navbar onMessagesClick={() => setShowMobileMessages(true)} />

      {/* Mobile Messages Page */}
      {showMobileMessages && (
        <div className="fixed inset-0 bg-[#232946] z-50 md:hidden">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-600">
              <h2 className="text-white text-lg font-bold">Messages</h2>
              <button
                onClick={() => setShowMobileMessages(false)}
                className="text-white bg-red-500 rounded-full p-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Tabs */}
            <div className="flex border-b border-gray-600">
              <button
                onClick={() => setActiveTab('users')}
                className={`flex-1 p-3 text-white font-bold ${
                  activeTab === 'users' ? 'bg-blue-600' : 'bg-gray-700'
                }`}
              >
                Users
              </button>
              <button
                onClick={() => setActiveTab('groups')}
                className={`flex-1 p-3 text-white font-bold ${
                  activeTab === 'groups' ? 'bg-blue-600' : 'bg-gray-700'
                }`}
              >
                Groups
              </button>
              <button
                onClick={() => setActiveTab('chatbot')}
                className={`p-3 font-bold ${
                  activeTab === 'chatbot' ? 'bg-green-600 text-white' : 'bg-gray-700 text-white'
                }`}
              >
                Bot
              </button>
            </div>
            
            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {activeTab === 'chatbot' ? (
                <CleanChatbot />
              ) : activeTab === 'users' ? (
                users.map((user, index) => (
                  <div
                    key={index}
                    onClick={() => handleUserSelect(user._id)}
                    className="cursor-pointer p-3 rounded-lg bg-neutral-700 hover:bg-neutral-600 flex items-center"
                  >
                    <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 mr-3">
                      <img src={aman} alt="User Avatar" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h1 className="text-white font-semibold text-sm truncate">{user.name}</h1>
                        {onlineUsers.includes(String(user._id)) && (
                          <span className="text-green-400 text-xs font-semibold">online</span>
                        )}
                      </div>
                      <p className="text-gray-300 text-xs truncate">
                        {recentMessages[user._id] || "No messages yet"}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                groups.map((group, index) => (
                  <div
                    key={index}
                    onClick={() => handleGroupSelect(group._id)}
                    className="cursor-pointer p-3 rounded-lg bg-neutral-700 hover:bg-neutral-600 flex items-center"
                  >
                    <div className="w-10 h-10 rounded-full flex-shrink-0 mr-3 bg-blue-500 flex items-center justify-center">
                      <span className="text-white font-bold text-sm">{group.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h1 className="text-white font-semibold text-sm truncate">{group.name}</h1>
                      <p className="text-gray-300 text-xs truncate">{group.members.length} members</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 overflow-hidden">
        {/* Desktop Layout */}
        <div className="hidden md:grid mt-14 w-full h-full" style={{ height: "calc(100vh - 108px)" }}>
          <div className={`grid w-full h-full ${
            showchatbot
              ? "lg:grid-cols-[15.625rem_1fr_21rem] md:grid-cols-[12rem_1fr_18rem]"
              : "lg:grid-cols-[15.625rem_1fr] md:grid-cols-[12rem_1fr]"
          }`}>
          {/* Desktop Sidebar */}
          <div className="bg-[#232946] rounded-t-2xl h-full flex flex-col overflow-hidden">
            <div className="flex border-2 border-black rounded-t-2xl overflow-hidden flex-shrink-0">
              <button
                onClick={() => setActiveTab('users')}
                className={`flex-1 p-2 text-white font-bold transition-colors text-sm ${
                  activeTab === 'users' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                Users
              </button>
              <button
                onClick={() => setActiveTab('groups')}
                className={`flex-1 p-2 text-white font-bold transition-colors text-sm ${
                  activeTab === 'groups' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                Groups
              </button>
            </div>
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
                  <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 mr-3">
                    <img src={aman} alt="User Avatar" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h1 className="text-white font-semibold text-sm truncate">{user.name}</h1>
                      {onlineUsers.includes(String(user._id)) && (
                        <span className="text-green-400 text-xs font-semibold">online</span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <p className={`text-gray-300 text-xs truncate flex-1 ${
                        unreadUsers[user._id] ? "font-bold text-white" : ""
                      }`}>
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
                  <div className="w-10 h-10 rounded-full flex-shrink-0 mr-3 bg-blue-500 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">{group.name.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="mb-1">
                      <h1 className="text-white font-semibold text-sm truncate">{group.name}</h1>
                    </div>
                    <div>
                      <p className="text-gray-300 text-xs truncate">{group.members.length} members</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Desktop Chat Area */}
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
                groupMembers={groups.find(g=>g._id === selectedGroupId)?.members || []}
                showChatbot={showchatbot}
              />
            ) : (
              <div className="h-full flex items-center justify-center flex-col p-4">
                <Posts/>
              </div>
            )}
          </div>

          {/* Desktop Chatbot */}
          {showchatbot && (
            <div className="bg-[#232946] rounded-t-2xl h-full">
              <Chatbot_Container onClose={() => setshowchatbot(false)} />
            </div>
          )}
          </div>
        </div>

        {/* Mobile Layout - Posts Only */}
        <div className="md:hidden mt-14 h-full bg-[#edf0f3] rounded-t-2xl" style={{ height: "calc(100vh - 108px)" }}>
          {selectedUserId ? (
            <ChatWindow
              sendigToUsersId={selectedUserId}
              userid={userId}
              showChatbot={false}
              otherUserName={users.find(u => u._id === selectedUserId)?.name || 'User'}
            />
          ) : selectedGroupId ? (
            <GroupChatWindow
              groupId={selectedGroupId}
              userid={userId}
              groupName={groups.find(g => g._id === selectedGroupId)?.name || 'Group Chat'}
              memberCount={groups.find(g => g._id === selectedGroupId)?.members.length || 0}
              groupCreatorId={groups.find(g => g._id === selectedGroupId)?.createdBy || null}
              groupMembers={groups.find(g=>g._id === selectedGroupId)?.members || []}
              showChatbot={false}
            />
          ) : showChatbot ? (
            <div className="h-full">
              <Chatbot_Container onClose={() => setShowChatbot(false)} />
            </div>
          ) : (
            <div className="h-full flex items-center justify-center flex-col p-4">
              <Posts/>
            </div>
          )}
        </div>
      </main>

      {/* Chatbot floating button - Desktop only */}
      {!showchatbot && (
        <img
          onClick={() => setshowchatbot(true)}
          className="hidden md:block fixed w-12 bottom-6 right-6 cursor-pointer h-auto z-30"
          src={chatboticon}
          alt="chatbot"
        />
      )}
    </div>
  );
}

export default Dashboard;