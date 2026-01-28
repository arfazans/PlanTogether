import React, { useState, useContext, useEffect } from "react";
import Navbar from "../../shared/components/layout/Navbar";
import Chatbot_Container from "../../features/messaging/components/Chatbot_Container";
import chatboticon from "../../assets/chat.png";
import ChatWindow from "../../features/messaging/components/ChatWindow";
import GroupChatWindow from "../../features/groups/components/GroupChatWindow";
import aman from "../../assets/aman.jpg";
import axios from "axios";
import { NoteContext } from "../../ContextApi/CreateContext";
import UserListItem from "../../shared/components/ui/UserListItem";
import GroupListItem from "../../shared/components/ui/GroupListItem";
import UserList from "../../shared/components/ui/UserList";
import GroupList from "../../shared/components/ui/GroupList";

function Dashboard() {
  const URL = "http://localhost:9860";
  const [showchatbot, setshowchatbot] = useState(false);
  const [users, setUsers] = useState([]); // all users from DB
  const [groups, setGroups] = useState([]); // user's groups
  const [posts, setPosts] = useState([]); // all posts
  const [activeTab, setActiveTab] = useState('users'); // 'users' or 'groups'
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [editingPost, setEditingPost] = useState(null);
  const [editPostCaption, setEditPostCaption] = useState('');
  const [showComments, setShowComments] = useState({});
  const [newComment, setNewComment] = useState({});
  const [showLikes, setShowLikes] = useState({});
  // Mobile states
  const [showMobileMessages, setShowMobileMessages] = useState(false);
  const [mobileMessageTab, setMobileMessageTab] = useState('users'); // 'users', 'groups', 'chatbot'
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

  // Handle back to list on mobile
  const handleBackToList = () => {
    setSelectedUserId(null);
    setSelectedGroupId(null);
  };

  // Check URL parameter for messages on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('messages') === 'true') {
      setShowMobileMessages(true);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

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

  // Fetch all posts on component mount
  useEffect(() => {
    axios.get(`${URL}/post/all`, { withCredentials: true }).then((res) => {
      if (res.data.success) {
        setPosts(res.data.posts);
      }
    }).catch((error) => {
      console.error('Error fetching posts:', error);
    });
  }, []);

  const handleEditPost = async (postId) => {
    try {
      const res = await axios.put(`${URL}/post/${postId}`, { caption: editPostCaption }, { withCredentials: true });
      if (res.data.success) {
        setPosts(posts.map(post => post._id === postId ? res.data.post : post));
        setEditingPost(null);
        setEditPostCaption('');
      }
    } catch (error) {
      console.error('Error updating post:', error);
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      const res = await axios.delete(`${URL}/post/${postId}`, { withCredentials: true });
      if (res.data.success) {
        setPosts(posts.filter(post => post._id !== postId));
      }
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const handleLikePost = async (postId) => {
    try {
      const res = await axios.post(`${URL}/post/${postId}/like`, {}, { withCredentials: true });
      if (res.data.success) {
        setPosts(posts.map(post => post._id === postId ? res.data.post : post));
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleAddComment = async (postId) => {
    const commentText = newComment[postId];
    if (!commentText?.trim()) return;

    try {
      const res = await axios.post(`${URL}/post/${postId}/comment`, { text: commentText }, { withCredentials: true });
      if (res.data.success) {
        setPosts(posts.map(post => post._id === postId ? res.data.post : post));
        setNewComment({ ...newComment, [postId]: '' });
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  return (
    <div className="h-screen w-full flex flex-col bg-[#232946] relative">
      <Navbar showMobileMessages={showMobileMessages} setShowMobileMessages={setShowMobileMessages} />

      {/* Mobile message tabs - only show when showMobileMessages is true */}
      {showMobileMessages && (
        <div className="md:hidden bg-[#232946] border-b border-gray-600 mt-14">
          <div className="flex">
            <button
              onClick={() => setMobileMessageTab('users')}
              className={`flex-1 p-3 text-white font-medium transition-colors ${
                mobileMessageTab === 'users' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              Users
            </button>
            <button
              onClick={() => setMobileMessageTab('groups')}
              className={`flex-1 p-3 text-white font-medium transition-colors ${
                mobileMessageTab === 'groups' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              Groups
            </button>
            <button
              onClick={() => setMobileMessageTab('chatbot')}
              className={`flex-1 p-3 text-white font-medium transition-colors ${
                mobileMessageTab === 'chatbot' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              Chatbot
            </button>
          </div>
        </div>
      )}

      <main className="flex-1 overflow-hidden">
        <div
          className={`grid w-full ${
            showMobileMessages 
              ? "md:grid-cols-[15.625rem_1fr] grid-cols-1 mt-0" 
              : showchatbot
              ? "md:grid-cols-[15.625rem_1fr_21rem] grid-cols-1 mt-14"
              : "md:grid-cols-[15.625rem_1fr] grid-cols-1 mt-14"
          }`}
          style={{ height: showMobileMessages ? "calc(100vh - 160px)" : "calc(100vh - 108px)" }}
        >
          {/* Left column - User sidebar - hidden on mobile when showMobileMessages is false */}
          <div className={`bg-[#232946] rounded-t-2xl h-full flex-col overflow-hidden ${
            showMobileMessages ? 'hidden md:flex' : 'hidden md:flex'
          }`}>
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
              <UserListItem
                key={index}
                user={user}
                onlineUsers={onlineUsers}
                unreadUsers={unreadUsers}
                recentMessages={recentMessages}
                onClick={handleUserSelect}
                isSelected={selectedUserId === user._id}
              />
            ))}
            {activeTab === 'groups' && groups.map((group, index) => (
              <GroupListItem
                key={index}
                group={group}
                onClick={handleGroupSelect}
                isSelected={selectedGroupId === group._id}
              />
            ))}
            </div>
          </div>

          {/* Middle column - Posts feed or Chat */}
          <div className="md:rounded-t-2xl bg-[#edf0f3] h-full overflow-hidden">
            {/* Mobile message view */}
            {showMobileMessages && (
              <div className="md:hidden h-full">
                {mobileMessageTab === 'users' && (
                  <div className="h-full flex flex-col">
                    {selectedUserId ? (
                      <ChatWindow
                        sendigToUsersId={selectedUserId}
                        userid={userId}
                        showChatbot={false}
                        otherUserName={users.find(u => u._id === selectedUserId)?.name || 'User'}
                        isMobile={true}
                        onBack={handleBackToList}
                      />
                    ) : (
                      <UserList
                        users={users}
                        onlineUsers={onlineUsers}
                        unreadUsers={unreadUsers}
                        recentMessages={recentMessages}
                        onUserSelect={handleUserSelect}
                        selectedUserId={selectedUserId}
                      />
                    )}
                  </div>
                )}
                {mobileMessageTab === 'groups' && (
                  <div className="h-full flex flex-col">
                    {selectedGroupId ? (
                      <GroupChatWindow
                        groupId={selectedGroupId}
                        userid={userId}
                        groupName={groups.find(g => g._id === selectedGroupId)?.name || 'Group Chat'}
                        memberCount={groups.find(g => g._id === selectedGroupId)?.members.length || 0}
                        groupCreatorId={groups.find(g => g._id === selectedGroupId)?.createdBy || null}
                        groupMembers={groups.find(g=>g._id === selectedGroupId)?.members || []}
                        showChatbot={false}
                        isMobile={true}
                        onBack={handleBackToList}
                      />
                    ) : (
                      <GroupList
                        groups={groups}
                        onGroupSelect={handleGroupSelect}
                        selectedGroupId={selectedGroupId}
                      />
                    )}
                  </div>
                )}
                {mobileMessageTab === 'chatbot' && (
                  <div className="h-full bg-[#232946]">
                    <Chatbot_Container isMobile={true} />
                  </div>
                )}
              </div>
            )}
            
            {/* Desktop view or mobile posts view */}
            {!showMobileMessages && (
              <>
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
              <div className="h-full overflow-y-auto p-4">
                <div className="max-w-2xl mx-auto space-y-4">
                  {posts.length === 0 ? (
                    <div className="text-center text-gray-500 mt-20">
                      <p>No posts yet. Be the first to share something!</p>
                    </div>
                  ) : (
                    posts.map((post) => (
                      <div key={post._id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center space-x-3">
                            <img
                              src={post.userId.profileImage || aman}
                              alt="Profile"
                              className="w-12 h-12 rounded-full object-cover"
                            />
                            <div>
                              <h5 className="font-semibold text-gray-800">{post.userId.name}</h5>
                              <p className="text-sm text-gray-500">{new Date(post.createdAt).toLocaleDateString()}</p>
                            </div>
                          </div>

                          {post.userId._id === userId && (
                            <div className="relative">
                              <button
                                onClick={() => setEditingPost(editingPost === post._id ? null : post._id)}
                                className="text-gray-500 hover:text-gray-700 p-1"
                              >
                                ⋯
                              </button>
                              {editingPost === post._id && (
                                <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                                  <button
                                    onClick={() => {
                                      setEditPostCaption(post.caption);
                                      setEditingPost(`edit-${post._id}`);
                                    }}
                                    className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDeletePost(post._id)}
                                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                                  >
                                    Delete
                                  </button>

                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {post.groupName && (
                          <div className="mb-3">
                            <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                              {post.groupName}
                            </span>
                          </div>
                        )}

                        {editingPost === `edit-${post._id}` ? (
                          <div className="space-y-3">
                            <textarea
                              value={editPostCaption}
                              onChange={(e) => setEditPostCaption(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                              rows="3"
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEditPost(post._id)}
                                className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditingPost(null)}
                                className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-gray-700 mb-4 leading-relaxed">{post.caption}</p>
                        )}

                        {post.image && (
                          <div className="mb-4">
                            <img
                              src={post.image}
                              alt="Post"
                              className="w-full max-h-96 object-cover rounded-lg"
                            />
                          </div>
                        )}

                        {/* Post Actions */}
                        <div className="flex items-center space-x-6 pt-3 border-t border-gray-100">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleLikePost(post._id)}
                              className="transition-colors"
                            >
                              <svg
                                className={`w-5 h-5 ${post.likes?.some(like => like._id === userId) ? 'text-red-500 fill-current' : 'text-gray-600'}`}
                                fill={post.likes?.some(like => like._id === userId) ? 'currentColor' : 'none'}
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                              </svg>
                            </button>
                            <span className="text-sm font-medium">{post.likes?.length || 0}</span>
                            <button
                              onClick={() => {
                                setShowLikes({...showLikes, [post._id]: !showLikes[post._id]});
                                if (!showLikes[post._id]) {
                                  setShowComments({...showComments, [post._id]: false});
                                }
                              }}
                              className="text-sm hover:underline"
                            >
                              likes
                            </button>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => {
                                setShowComments({...showComments, [post._id]: !showComments[post._id]});
                                if (!showComments[post._id]) {
                                  setShowLikes({...showLikes, [post._id]: false});
                                }
                              }}
                              className="text-gray-600 hover:text-blue-600 transition-colors"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                              </svg>
                            </button>
                            <span className="text-sm font-medium">{post.comments?.length || 0}</span>
                            <span className="text-sm">comments</span>
                          </div>
                        </div>

                        {/* Show likes */}
                        {showLikes[post._id] && post.likes?.length > 0 && (
                          <div className="mt-2 p-3 bg-gray-50 rounded text-sm">
                            <p className="font-semibold mb-2">Liked by:</p>
                            <div className="space-y-2 max-h-32 overflow-y-auto">
                              {post.likes.map((like) => (
                                <div key={like._id} className="flex items-center space-x-2">
                                  <img
                                    src={like.profileImage || aman}
                                    alt="Profile"
                                    className="w-6 h-6 rounded-full flex-shrink-0"
                                  />
                                  <span className="text-gray-700 font-medium">{like.name}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Comments section */}
                        {showComments[post._id] && (
                          <div className="mt-3">
                            {/* Add comment input at top */}
                            <div className="flex space-x-2 mb-3 pb-3 border-b border-gray-200">
                              <input
                                type="text"
                                value={newComment[post._id] || ''}
                                onChange={(e) => setNewComment({...newComment, [post._id]: e.target.value})}
                                placeholder="Add a comment..."
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:border-blue-500"
                                onKeyPress={(e) => e.key === 'Enter' && handleAddComment(post._id)}
                              />
                              <button
                                onClick={() => handleAddComment(post._id)}
                                className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm hover:bg-blue-600"
                              >
                                Post
                              </button>
                            </div>

                            {/* Comments list - scrollable, max 4 visible */}
                            {post.comments?.length > 0 && (
                              <div className="max-h-32 overflow-y-auto space-y-2">
                                {post.comments.slice().reverse().map((comment) => (
                                  <div key={comment._id} className="flex space-x-2 text-sm">
                                    <img
                                      src={comment.userId.profileImage || aman}
                                      alt="Profile"
                                      className="w-6 h-6 rounded-full flex-shrink-0"
                                    />
                                    <div className="flex-1">
                                      <span className="font-semibold">{comment.userId.name}</span>
                                      <span className="ml-2 text-gray-700">{comment.text}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Right column - Chatbot - hidden on mobile */}
          {showchatbot && !showMobileMessages && (
            <div className="hidden md:block bg-[#232946] rounded-t-2xl h-full">
              <Chatbot_Container onClose={() => setshowchatbot(false)} />
            </div>
          )}
          
          {/* Chatbot icon - hidden on mobile when showMobileMessages is true */}
          {!showchatbot && !showMobileMessages && (
            <img
              onClick={() => setshowchatbot(true)}
              className="absolute w-12 bottom-6 right-6 cursor-pointer h-auto md:block hidden"
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