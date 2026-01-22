import React, { useState, useEffect } from "react";
import axios from "axios";
import './Posts.css';

const Posts = () => {
  const [posts, setPosts] = useState([]);
  const [commentTexts, setCommentTexts] = useState({});
  const [showComments, setShowComments] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showLikedUsers, setShowLikedUsers] = useState({});
  const [likedUsersData, setLikedUsersData] = useState({});
  const [showPostMenu, setShowPostMenu] = useState({});
  const [editingPost, setEditingPost] = useState(null);
  const [editCaption, setEditCaption] = useState('');
  const [currentUserId, setCurrentUserId] = useState(null);
  const [likedPosts, setLikedPosts] = useState(new Set());

  useEffect(() => {
    fetchPosts();
    getCurrentUser();
  }, []);

  const getCurrentUser = async () => {
    try {
      const res = await axios.get("http://localhost:9860/user/me", { withCredentials: true });
      if (res.data.success) {
        setCurrentUserId(res.data.user._id);
      }
    } catch (error) {
      console.error("Error getting current user:", error);
    }
  };

  const fetchPosts = async () => {
    try {
      const res = await axios.get("http://localhost:9860/post/all", { withCredentials: true });
      if (res.data.success) {
        setPosts(res.data.posts);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  const handleLike = async (postId) => {
    try {
      const res = await axios.post(`http://localhost:9860/post/like/${postId}`, {}, { withCredentials: true });
      if (res.data.success) {
        setPosts(posts.map(post =>
          post._id === postId ? {
            ...post,
            likes: Array.from({ length: res.data.likesCount }),
            isLiked: res.data.isLiked
          } : post
        ));
      }
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  const handleComment = async (postId) => {
    const text = commentTexts[postId];
    if (!text?.trim()) return;

    try {
      const res = await axios.post(`http://localhost:9860/post/comment/${postId}`, { text }, { withCredentials: true });
      if (res.data.success) {
        setPosts(posts.map(post =>
          post._id === postId ? {
            ...post,
            comments: [...(Array.isArray(post.comments) ? post.comments : []), res.data.comment]
          } : post
        ));
        setCommentTexts({ ...commentTexts, [postId]: '' });
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const toggleComments = (postId) => {
    setShowComments({ ...showComments, [postId]: !showComments[postId] });
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoomLevel(prev => Math.min(Math.max(prev + delta, 0.5), 3));
  };

  const getLikedUsers = async (postId) => {
    try {
      const res = await axios.get(`http://localhost:9860/post/likes/${postId}`, { withCredentials: true });
      if (res.data.success) {
        setLikedUsersData({ ...likedUsersData, [postId]: res.data.likedUsers });
        setShowLikedUsers({ ...showLikedUsers, [postId]: !showLikedUsers[postId] });
      }
    } catch (error) {
      console.error("Error getting liked users:", error);
    }
  };

  const handleEditPost = (post) => {
    setEditingPost(post._id);
    setEditCaption(post.caption);
    setShowPostMenu({ ...showPostMenu, [post._id]: false });
  };

  const handleUpdatePost = async (postId) => {
    try {
      const res = await axios.put(`http://localhost:9860/post/update/${postId}`, { caption: editCaption }, { withCredentials: true });
      if (res.data.success) {
        setPosts(posts.map(post => post._id === postId ? { ...post, caption: editCaption } : post));
        setEditingPost(null);
        setEditCaption('');
      }
    } catch (error) {
      console.error("Error updating post:", error);
    }
  };

  const handleDeletePost = async (postId) => {
    if (confirm('Are you sure you want to delete this post?')) {
      try {
        const res = await axios.delete(`http://localhost:9860/post/delete/${postId}`, { withCredentials: true });
        if (res.data.success) {
          setPosts(posts.filter(post => post._id !== postId));
        }
      } catch (error) {
        console.error("Error deleting post:", error);
      }
    }
    setShowPostMenu({ ...showPostMenu, [postId]: false });
  };

  return (
    <div className="h-screen  bg-gradient-to-br from-purple-50 to-blue-50 overflow-y-auto scrollbar-hide">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {posts.length === 0 ? (
          <div className="text-center text-gray-500 mt-20">
            <div className="bg-white rounded-2xl shadow-lg p-12">
              <div className="text-6xl mb-4">Camera</div>
              <h2 className="text-3xl font-bold text-gray-700 mb-2">No posts yet</h2>
              <p className="text-lg text-gray-500">Be the first to share something amazing!</p>
            </div>
          </div>
        ) : (
          <div className="space-y-8 ">
            {posts.map((post) => (
              <div key={post._id} className="post-card  bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                {/* Post Header */}
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                        <span className="text-lg font-bold">{post.userName.charAt(0).toUpperCase()}</span>

                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{post.userName}</h3>
                        {post.groupName && <p className="text-sm opacity-90">{post.groupName}</p>}
                      </div>
                    </div>
                    {currentUserId && (currentUserId === post.userId || currentUserId === post.user?._id) && (
                      <div className="relative">
                        <button
                          onClick={() => setShowPostMenu({ ...showPostMenu, [post._id]: !showPostMenu[post._id] })}
                          className="text-white hover:text-gray-300 p-2 rounded-full hover:bg-white/20 transition-colors"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                          </svg>
                        </button>
                        {showPostMenu[post._id] && (
                          <div className="absolute right-0 top-10 bg-white text-black rounded-lg shadow-xl py-2 w-36 z-50 border">
                            <button
                              onClick={() => handleEditPost(post)}
                              className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm flex items-center space-x-2"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              <span>Edit Caption</span>
                            </button>
                            <button
                              onClick={() => handleDeletePost(post._id)}
                              className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-red-600 flex items-center space-x-2"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              <span>Delete Post</span>
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Post Image */}
                <div className="relative">
                  <img
                    src={post.image}
                    alt="Post"
                    className="w-full h-96 object-cover cursor-pointer"
                    onClick={() => setSelectedImage(post.image)}
                  />
                </div>

                {/* Post Caption */}
                {post.caption && (
                  <div className="p-4">
                    {editingPost === post._id ? (
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={editCaption}
                          onChange={(e) => setEditCaption(e.target.value)}
                          className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          onKeyPress={(e) => e.key === 'Enter' && handleUpdatePost(post._id)}
                        />
                        <button
                          onClick={() => handleUpdatePost(post._id)}
                          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => { setEditingPost(null); setEditCaption(''); }}
                          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <p className="text-gray-800 leading-relaxed">{post.caption}</p>
                    )}
                  </div>
                )}

                {/* Post Actions */}
                <div className="border-t border-gray-100 p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex space-x-6">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleLike(post._id)}
                          className="like-btn hover:opacity-80 transition-opacity duration-200"
                        >
                          <svg className="w-6 h-6" viewBox="0 0 24 24" stroke={post.isLiked ? "none" : "black"} strokeWidth="2" fill={post.isLiked ? "red" : "white"}>
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                          </svg>
                        </button>
                        <span
                          onClick={() => getLikedUsers(post._id)}
                          className="font-medium cursor-pointer hover:underline text-gray-600"
                        >
                          {Array.isArray(post.likes) ? post.likes.length : 0} likes
                        </span>
                      </div>

                      <button
                        onClick={() => toggleComments(post._id)}
                        className="flex items-center space-x-2 text-gray-600 hover:text-blue-500 transition-colors duration-200"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <span className="font-medium">{Array.isArray(post.comments) ? post.comments.filter(c => c && c.text).length : 0} comments</span>
                      </button>
                    </div>

                    {showComments[post._id] && (
                      <button
                        onClick={() => toggleComments(post._id)}
                        className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>

                  {/* Comments Section */}
                  {showComments[post._id] && (
                    <div className="space-y-4">
                      {/* Add Comment */}
                      <div className="flex space-x-3">
                        <input
                          type="text"
                          placeholder="Add a comment..."
                          value={commentTexts[post._id] || ''}
                          onChange={(e) => setCommentTexts({ ...commentTexts, [post._id]: e.target.value })}
                          className="comment-input flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          onKeyPress={(e) => e.key === 'Enter' && handleComment(post._id)}
                        />
                        <button
                          onClick={() => handleComment(post._id)}
                          className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full hover:from-purple-700 hover:to-blue-700 transition-all duration-200 font-medium"
                        >
                          Post
                        </button>
                      </div>

                      {/* Comments List */}
                      <div className="comments-scroll space-y-3 max-h-60 overflow-y-auto">
                        {Array.isArray(post.comments) && post.comments.filter(comment => comment && comment.text && comment.userName).map((comment, index) => (
                          <div key={index} className="flex space-x-3 p-3 bg-gray-50 rounded-lg">
                            <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full flex items-center justify-center">
                              <span className="text-white text-sm font-bold">{comment.userName.charAt(0).toUpperCase()}</span>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <span className="font-semibold text-sm text-gray-800">{comment.userName}</span>
                                <span className="text-xs text-gray-500">
                                  {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString() : ''}
                                </span>
                              </div>
                              <p className="text-gray-700 text-sm mt-1">{comment.text}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Liked Users Section */}
                  {showLikedUsers[post._id] && (
                    <div className="border-t pt-3 space-y-2">
                      <h4 className="font-semibold text-sm text-gray-800">Liked by:</h4>
                      <div className="max-h-32 overflow-y-auto space-y-2">
                        {likedUsersData[post._id]?.map((user, index) => (
                          <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                            <div className="w-6 h-6 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs font-bold">{user.name.charAt(0).toUpperCase()}</span>
                            </div>
                            <span className="text-sm font-medium text-gray-800">{user.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50" onClick={() => { setSelectedImage(null); setZoomLevel(1); }}>
          <div className="relative max-w-4xl max-h-full p-4" onWheel={handleWheel}>
            <img
              src={selectedImage}
              alt="Zoomed post"
              className="max-w-full max-h-full object-contain transition-transform duration-200"
              style={{ transform: `scale(${zoomLevel})` }}
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={() => { setSelectedImage(null); setZoomLevel(1); }}
              className="absolute top-4 right-4 text-white text-3xl hover:text-gray-300"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Posts;


