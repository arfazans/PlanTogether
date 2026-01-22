import React, { useState, useEffect } from 'react'
import './Profile.css'
import Navbar from './Navbar'
import Footer from './Footer'
import AddPostModal from './AddPostModal'
import axios from 'axios'

function Profile() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userPosts, setUserPosts] = useState([]);
  const [user, setUser] = useState({ name: 'User', email: '' });
  const [showComments, setShowComments] = useState({});
  const [commentTexts, setCommentTexts] = useState({});
  const [showLikedUsers, setShowLikedUsers] = useState({});
  const [likedUsersData, setLikedUsersData] = useState({});
  const [showPostMenu, setShowPostMenu] = useState({});
  const [editingPost, setEditingPost] = useState(null);
  const [editCaption, setEditCaption] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [likedPosts, setLikedPosts] = useState(new Set());
const [editProfileData, setEditProfileData] = useState({
  name: user.name || '',
  profileImage: null  // File | null
});

  useEffect(() => {
    fetchUserPosts();
    fetchUserInfo();
  }, []);

  const fetchUserPosts = async () => {
    try {
      const res = await axios.get("http://localhost:9860/post/user", { withCredentials: true });
      if (res.data.success) {
        setUserPosts(res.data.posts);
      }
    } catch (error) {
      console.error("Error fetching user posts:", error);
    }
  };

  const fetchUserInfo = async () => {
    try {
      const res = await axios.get("http://localhost:9860/user/me", { withCredentials: true });
      if (res.data.success) {
        console.log('Full user data:', res.data.user); // Debug log
        console.log('Profile image URL:', res.data.user.profileImage); // Debug log
        setUser(res.data.user);
      }
    } catch (error) {
      console.error("Error fetching user info:", error);
      // Fallback to placeholder
      setUser({ name: 'User', email: '' });
    }
  };

  const handlePostCreated = (newPost) => {
    setUserPosts([newPost, ...userPosts]);
    setIsModalOpen(false);
  };

  const handleLike = async (postId) => {
    try {
      const res = await axios.post(`http://localhost:9860/post/like/${postId}`, {}, { withCredentials: true });
      if (res.data.success) {
        setUserPosts(userPosts.map(post =>
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
        setUserPosts(userPosts.map(post =>
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
        setUserPosts(userPosts.map(post => post._id === postId ? { ...post, caption: editCaption } : post));
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
          setUserPosts(userPosts.filter(post => post._id !== postId));
        }
      } catch (error) {
        console.error("Error deleting post:", error);
      }
    }
    setShowPostMenu({ ...showPostMenu, [postId]: false });
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoomLevel(prev => Math.min(Math.max(prev + delta, 0.5), 3));
  };

  const handleEditProfile = () => {
    setEditProfileData({ name: user.name, profileImage: null });
    setIsEditProfileOpen(true);
  };

  const handleUpdateProfile = async () => {
  try {
    const formData = new FormData();
    formData.append('name', editProfileData.name);

    // Critical: Ensure editProfileData.profileImage is a File object from input
    if (editProfileData.profileImage) {
      formData.append('profileImage', editProfileData.profileImage);
    }

    const res = await axios.put("http://localhost:9860/user/profile-update", formData, {
      withCredentials: true
      // Remove: headers: { 'Content-Type': 'multipart/form-data' }
      // Axios handles this automatically with FormData
    });

    if (res.data.success) {
      setUser(res.data.user);
      setIsEditProfileOpen(false);
    }
  } catch (error) {
    // Better error logging
    console.error("Error updating profile:", error.response?.data || error.message);
  }
};


  return (
    <>
    <div>
      <main className="profile-page">
  <section className="relative block h-500-px">
    <div className="absolute top-0 w-full h-full bg-center bg-cover hero-background">
      <span id="blackOverlay" className="w-full h-full absolute opacity-50 bg-black"></span>
      <div className="navbar-overlay">
        <Navbar />
      </div>
      <div className="hero-text-overlay">
        <div className="hero-workflow">
          <span className="workflow-item">Discuss</span>
          <span className="arrow">→</span>
          <span className="workflow-item">Plan</span>
          <span className="cross">X</span>
          <span className="workflow-item cancel">Cancel</span>
          <span className="arrow-down">↓</span>
          <span className="workflow-item">Execute</span>
        </div>
      </div>
    </div>
    <div className="top-auto bottom-0 left-0 right-0 w-full absolute pointer-events-none overflow-hidden h-70-px" style={{transform: "translateZ(0px)"}}>
      <svg className="absolute bottom-0 overflow-hidden" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" version="1.1" viewBox="0 0 2560 100" x="0" y="0">
        <polygon className="text-blueGray-200 fill-current" points="2560 0 2560 100 0 100"></polygon>
      </svg>
    </div>
  </section>
  <section className="relative py-8 md:py-16 bg-blueGray-200">
    <div className="container mx-auto px-2 md:px-4">
      <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-xl rounded-lg -mt-32 md:-mt-64">
        <div className="px-3 md:px-6">
          <div className="flex flex-wrap justify-center">
            <div className="w-full lg:w-3/12 px-2 md:px-4 lg:order-2 flex justify-center">
              <div className="relative">
                <img
                  alt="Profile picture"
                  src={user.profileImage || "https://demos.creative-tim.com/notus-js/assets/img/team-2-800x800.jpg"}
                  className="shadow-xl rounded-full h-auto align-middle border-none absolute -m-16 -ml-20 lg:-ml-16 max-w-150-px w-32 h-32 lg:w-40 lg:h-40 object-cover"
                  style={{ zIndex: 10 }}
                  onLoad={() => console.log('Image loaded successfully')}
                  onError={(e) => {
                    console.log('Image failed to load, using fallback');
                    e.target.src = "https://demos.creative-tim.com/notus-js/assets/img/team-2-800x800.jpg";
                  }}
                />
              </div>
            </div>
        <div className="w-full lg:w-4/12 px-2 md:px-4 lg:order-3 flex flex-col lg:flex-row items-center lg:items-end justify-center lg:justify-end gap-2 py-4 lg:py-6 lg:pt-0">
  <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
    <button
      onClick={() => setIsModalOpen(true)}
      className="bg-pink-500 hover:bg-cyan-700 active:bg-pink-600 text-white font-bold shadow hover:shadow-md text-xs px-4 py-2 rounded transition-all duration-150 flex-1 lg:flex-none"
    >
      Add Posts
    </button>
    <button
      onClick={handleEditProfile}
      className="bg-blue-500 hover:bg-blue-700 active:bg-blue-600 text-white font-bold shadow hover:shadow-md text-xs px-4 py-2 rounded transition-all duration-150 flex-1 lg:flex-none"
    >
      Edit Profile
    </button>
  </div>
</div>


            <div className="w-full lg:w-4/12 px-2 md:px-4 lg:order-1">
              <div className="flex justify-center py-4 lg:pt-4 pt-8">
                <div className="mr-2 md:mr-4 p-2 md:p-3 text-center">
                  <span className="text-lg md:text-xl font-bold block uppercase tracking-wide text-blueGray-600">22</span><span className="text-xs md:text-sm text-blueGray-400">Friends</span>
                </div>
                <div className="mr-2 md:mr-4 p-2 md:p-3 text-center">
                  <span className="text-lg md:text-xl font-bold block uppercase tracking-wide text-blueGray-600">{userPosts.length}</span><span className="text-xs md:text-sm text-blueGray-400">Posts</span>
                </div>
                <div className="lg:mr-4 p-2 md:p-3 text-center">
                  <span className="text-lg md:text-xl font-bold block uppercase tracking-wide text-blueGray-600">{userPosts.reduce((total, post) => total + (post.comments?.length || 0), 0)}</span><span className="text-xs md:text-sm text-blueGray-400">Comments</span>
                </div>
              </div>
            </div>
          </div>
          <div className="text-center mt-4 md:mt-6">
            <h3 className="text-2xl md:text-4xl font-semibold leading-normal mb-2 text-blueGray-700">
              {user.name}
            </h3>
            <div className="text-xs md:text-sm leading-normal mt-0 mb-2 text-blueGray-400 font-bold uppercase">
              <i className="fas fa-map-marker-alt mr-2 text-sm md:text-lg text-blueGray-400"></i>
              {user.email}
            </div>
          </div>

          {/* User Posts Grid */}
          <div className="mt-6 md:mt-10 py-6 md:py-10 border-t border-blueGray-200">
            <div className="text-center mb-6 md:mb-8">
              <h4 className="text-xl md:text-2xl font-bold text-blueGray-700">My Posts</h4>
            </div>
            {userPosts.length === 0 ? (
              <div className="text-center text-gray-500 py-8 md:py-12">
                <div className="text-4xl md:text-6xl mb-4">Camera</div>
                <p className="text-base md:text-lg">No posts yet. Share your first moment!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {userPosts.map((post) => (
                  <div key={post._id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                    <div className="relative">
                      <div className="aspect-square">
                        <img
                          src={post.image}
                          alt="User post"
                          className="w-full h-full object-cover cursor-pointer"
                          onClick={() => setSelectedImage(post.image)}
                        />
                      </div>
                      <div className="absolute top-2 right-2">
                        <button
                          onClick={() => setShowPostMenu({ ...showPostMenu, [post._id]: !showPostMenu[post._id] })}
                          className="bg-black/50 text-white p-1 rounded-full hover:bg-black/70"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                          </svg>
                        </button>
                        {showPostMenu[post._id] && (
                          <div className="absolute right-0 top-8 bg-white text-black rounded-lg shadow-lg py-2 w-32 z-10">
                            <button
                              onClick={() => handleEditPost(post)}
                              className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                            >
                              Edit Caption
                            </button>
                            <button
                              onClick={() => handleDeletePost(post._id)}
                              className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-red-600"
                            >
                              Delete Post
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="p-3 md:p-4">
                      {post.caption && (
                        <div className="mb-3">
                          {editingPost === post._id ? (
                            <div className="space-y-2">
                              <textarea
                                value={editCaption}
                                onChange={(e) => setEditCaption(e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                                rows="2"
                              />
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleUpdatePost(post._id)}
                                  className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => { setEditingPost(null); setEditCaption(''); }}
                                  className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-gray-700 text-sm line-clamp-2">{post.caption}</p>
                          )}
                        </div>
                      )}
                      <div className="flex items-center justify-between text-sm mb-3">
                        <div className="flex items-center space-x-4">
                          <button
                            onClick={() => handleLike(post._id)}
                            className="flex items-center space-x-1 hover:opacity-80"
                          >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" stroke={post.isLiked ? "none" : "black"} strokeWidth="2" fill={post.isLiked ? "red" : "white"}>
                              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                            </svg>
                            <span
                              onClick={(e) => { e.stopPropagation(); getLikedUsers(post._id); }}
                              className="cursor-pointer hover:underline"
                            >
                              {post.likes?.length || 0}
                            </span>
                          </button>
                          <button
                            onClick={() => setShowComments({ ...showComments, [post._id]: !showComments[post._id] })}
                            className="flex items-center space-x-1 text-blue-500 hover:text-blue-600"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <span>{post.comments?.length || 0}</span>
                          </button>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                      </div>



                      {/* Comments Section */}
                      {showComments[post._id] && (
                        <div className="border-t pt-3 space-y-3">
                          <div className="flex space-x-2">
                            <input
                              type="text"
                              placeholder="Add a comment..."
                              value={commentTexts[post._id] || ''}
                              onChange={(e) => setCommentTexts({ ...commentTexts, [post._id]: e.target.value })}
                              className="flex-1 px-3 py-1 border rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                              onKeyPress={(e) => e.key === 'Enter' && handleComment(post._id)}
                            />
                            <button
                              onClick={() => handleComment(post._id)}
                              className="px-3 py-1 bg-purple-500 text-white rounded-full text-sm hover:bg-purple-600"
                            >
                              Post
                            </button>
                          </div>
                          <div className="max-h-32 overflow-y-auto space-y-2">
                            {Array.isArray(post.comments) && post.comments.filter(c => c && c.text).map((comment, index) => (
                              <div key={index} className="text-xs bg-gray-50 p-2 rounded">
                                <span className="font-semibold">{comment.userName}: </span>
                                <span>{comment.text}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Liked Users Section */}
                      {showLikedUsers[post._id] && (
                        <div className="border-t pt-3 space-y-2">
                          <h4 className="font-semibold text-xs text-gray-800">Liked by:</h4>
                          <div className="max-h-24 overflow-y-auto space-y-1">
                            {likedUsersData[post._id]?.map((user, index) => (
                              <div key={index} className="flex items-center space-x-2 p-1 bg-gray-50 rounded text-xs">
                                <div className="w-4 h-4 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full flex items-center justify-center">
                                  <span className="text-white text-xs font-bold">{user.name.charAt(0).toUpperCase()}</span>
                                </div>
                                <span className="font-medium text-gray-800">{user.name}</span>
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

          <div className="mt-6 md:mt-10 py-6 md:py-10 border-t border-blueGray-200 text-center">
            <div className="flex flex-wrap justify-center">
              <div className="w-full lg:w-9/12 px-2 md:px-4">
                <p className="mb-4 text-base md:text-lg leading-relaxed text-blueGray-700">
                  An artist of considerable range, Jenna the name taken by
                  Melbourne-raised, Brooklyn-based Nick Murphy writes,
                  performs and records all of his own music, giving it a
                  warm, intimate feel with a solid groove structure. An
                  artist of considerable range.
                </p>
                <a href="#pablo" className="font-normal text-pink-500">Show more</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

  </section>
  <AddPostModal
    isOpen={isModalOpen}
    onClose={() => setIsModalOpen(false)}
    onPostCreated={handlePostCreated}
  />

  {/* Edit Profile Modal */}
  {isEditProfileOpen && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-4 md:p-6 w-full max-w-md mx-4">
        <h3 className="text-lg md:text-xl font-bold mb-4 text-gray-800">Edit Profile</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={editProfileData.name}
              onChange={(e) => setEditProfileData({ ...editProfileData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Profile Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setEditProfileData({ ...editProfileData, profileImage: e.target.files[0] })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <button
            onClick={handleUpdateProfile}
            className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors text-sm"
          >
            Save Changes
          </button>
          <button
            onClick={() => setIsEditProfileOpen(false)}
            className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )}

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
</main>
    </div>
        <Footer/>

        </>
  )
}

export default Profile
