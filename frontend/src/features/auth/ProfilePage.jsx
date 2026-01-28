import React, { useState, useEffect, useContext } from 'react'
import './ProfilePage.css'
import Navbar from '../../shared/components/layout/Navbar'
import { NoteContext } from '../../ContextApi/CreateContext'
import axios from 'axios'

function ProfilePage() {
  const { userId } = useContext(NoteContext)
  const [user, setUser] = useState(null)
  const [posts, setPosts] = useState([])
  const [isEditing, setIsEditing] = useState(false)
  const [showAddPost, setShowAddPost] = useState(false)
  const [editingPost, setEditingPost] = useState(null)
  
  // Form states
  const [editForm, setEditForm] = useState({ name: '' })
  const [profileImageFile, setProfileImageFile] = useState(null)
  const [postForm, setPostForm] = useState({ caption: '', groupName: '' })
  const [postImageFile, setPostImageFile] = useState(null)
  const [editPostCaption, setEditPostCaption] = useState('')
  const [showComments, setShowComments] = useState({})
  const [newComment, setNewComment] = useState({})
  const [showLikes, setShowLikes] = useState({})
  
  const URL = "http://localhost:9860"

  // Fetch user profile and posts
  useEffect(() => {
    if (userId) {
      fetchUserProfile()
      fetchUserPosts()
    }
  }, [userId])

  const fetchUserProfile = async () => {
    try {
      const res = await axios.get(`${URL}/user/check-auth`, { withCredentials: true })
      console.log('User data:', res.data)
      setUser(res.data)
      setEditForm({ name: res.data.name })
    } catch (error) {
      console.error('Error fetching user profile:', error)
    }
  }

  const fetchUserPosts = async () => {
    try {
      const res = await axios.get(`${URL}/post/user`, { withCredentials: true })
      if (res.data.success) {
        setPosts(res.data.posts)
      }
    } catch (error) {
      console.error('Error fetching posts:', error)
    }
  }

  const handleEditProfile = async () => {
    try {
      const formData = new FormData()
      formData.append('name', editForm.name)
      if (profileImageFile) {
        formData.append('profileImage', profileImageFile)
      }
      
      const res = await axios.put(`${URL}/user/profile-update`, formData, { 
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      if (res.data.success) {
        setUser(res.data.user)
        setIsEditing(false)
        setProfileImageFile(null)
        // Refresh the page to update all user data
        window.location.reload()
      }
    } catch (error) {
      console.error('Error updating profile:', error)
    }
  }

  const handleAddPost = async () => {
    try {
      const formData = new FormData()
      formData.append('caption', postForm.caption)
      formData.append('groupName', postForm.groupName)
      if (postImageFile) {
        formData.append('postImage', postImageFile)
      }
      
      const res = await axios.post(`${URL}/post/create`, formData, { 
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      if (res.data.success) {
        setPosts([res.data.post, ...posts])
        setPostForm({ caption: '', groupName: '' })
        setPostImageFile(null)
        setShowAddPost(false)
      }
    } catch (error) {
      console.error('Error creating post:', error)
    }
  }

  const handleEditPost = async (postId) => {
    try {
      const res = await axios.put(`${URL}/post/${postId}`, { caption: editPostCaption }, { withCredentials: true })
      if (res.data.success) {
        setPosts(posts.map(post => post._id === postId ? res.data.post : post))
        setEditingPost(null)
        setEditPostCaption('')
      }
    } catch (error) {
      console.error('Error updating post:', error)
    }
  }

  const handleDeletePost = async (postId) => {
    try {
      const res = await axios.delete(`${URL}/post/${postId}`, { withCredentials: true })
      if (res.data.success) {
        setPosts(posts.filter(post => post._id !== postId))
      }
    } catch (error) {
      console.error('Error deleting post:', error)
    }
  }

  const handleLikePost = async (postId) => {
    try {
      const res = await axios.post(`${URL}/post/${postId}/like`, {}, { withCredentials: true })
      if (res.data.success) {
        setPosts(posts.map(post => post._id === postId ? res.data.post : post))
      }
    } catch (error) {
      console.error('Error liking post:', error)
    }
  }

  const handleAddComment = async (postId) => {
    const commentText = newComment[postId]
    if (!commentText?.trim()) return
    
    try {
      const res = await axios.post(`${URL}/post/${postId}/comment`, { text: commentText }, { withCredentials: true })
      if (res.data.success) {
        setPosts(posts.map(post => post._id === postId ? res.data.post : post))
        setNewComment({ ...newComment, [postId]: '' })
      }
    } catch (error) {
      console.error('Error adding comment:', error)
    }
  }

  if (!user) return <div>Loading...</div>

  return (
    <div className="overflow-x-hidden">
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
                <span className="cross">✕</span>
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
        
        <section className="relative py-16 bg-blueGray-200">
          <div className="container mx-auto px-4">
            <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-xl rounded-lg -mt-64">
              <div className="px-6">
                <div className="flex flex-wrap justify-center">
                  <div className="w-full lg:w-3/12 px-4 lg:order-2 flex justify-center">
                    <div className="relative">
                      {console.log('Profile image URL:', user.profileImage || 'No profile image')}
                      <img 
                        alt="Profile picture" 
                        src={user.profileImage || "https://demos.creative-tim.com/notus-js/assets/img/team-2-800x800.jpg"} 
                        className="shadow-xl rounded-full border-none w-32 h-32 object-cover" 
                        onError={(e) => {
                          console.log('Image failed to load:', e.target.src)
                          e.target.src = "https://demos.creative-tim.com/notus-js/assets/img/team-2-800x800.jpg"
                        }}
                        onLoad={() => console.log('Image loaded successfully')}
                      />
                    </div>
                  </div>
                  
                  <div className="w-full lg:w-4/12 px-4 lg:order-3 lg:text-right lg:self-center">
                    <div className="py-6 px-3 mt-32 sm:mt-0 flex flex-wrap gap-2 justify-center lg:justify-end">
                      <button 
                        onClick={() => setIsEditing(!isEditing)}
                        className="bg-blue-500 active:bg-blue-600 uppercase text-white font-bold hover:shadow-md shadow text-xs px-4 py-2 rounded outline-none focus:outline-none ease-linear transition-all duration-150" 
                        type="button"
                      >
                        {isEditing ? 'Cancel' : 'Edit'}
                      </button>
                      <button 
                        onClick={() => setShowAddPost(!showAddPost)}
                        className="bg-green-500 active:bg-green-600 uppercase text-white font-bold hover:shadow-md shadow text-xs px-4 py-2 rounded outline-none focus:outline-none ease-linear transition-all duration-150" 
                        type="button"
                      >
                        Add Post
                      </button>
                    </div>
                  </div>
                  
                  <div className="w-full lg:w-4/12 px-4 lg:order-1">
                    <div className="flex justify-center py-4 lg:pt-4 pt-8">
                      <div className="mr-4 p-3 text-center">
                        <span className="text-xl font-bold block uppercase tracking-wide text-blueGray-600">22</span>
                        <span className="text-sm text-blueGray-400">Friends</span>
                      </div>
                      <div className="mr-4 p-3 text-center">
                        <span className="text-xl font-bold block uppercase tracking-wide text-blueGray-600">{posts.length}</span>
                        <span className="text-sm text-blueGray-400">Posts</span>
                      </div>
                      <div className="lg:mr-4 p-3 text-center">
                        <span className="text-xl font-bold block uppercase tracking-wide text-blueGray-600">89</span>
                        <span className="text-sm text-blueGray-400">Comments</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="text-center mt-12">
                  <h3 className="text-4xl font-semibold leading-normal mb-2 text-blueGray-700">
                    {user.name}
                  </h3>
                  <div className="text-sm leading-normal mt-0 mb-2 text-blueGray-400 font-bold uppercase">
                    <i className="fas fa-map-marker-alt mr-2 text-lg text-blueGray-400"></i>
                    {user.email}
                  </div>
                </div>

                {/* Edit Profile Modal */}
                {isEditing && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                      <h3 className="text-xl font-semibold mb-4">Edit Profile</h3>
                      <div className="space-y-4">
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                          placeholder="Enter name"
                        />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setProfileImageFile(e.target.files[0])}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                        />
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => setIsEditing(false)}
                            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleEditProfile}
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Add Post Modal */}
                {showAddPost && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                      <h4 className="text-xl font-semibold mb-4">Create New Post</h4>
                      <div className="space-y-4">
                        <textarea
                          value={postForm.caption}
                          onChange={(e) => setPostForm({...postForm, caption: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                          placeholder="What's on your mind?"
                          rows="3"
                          required
                        />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setPostImageFile(e.target.files[0])}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                        />
                        <input
                          type="text"
                          value={postForm.groupName}
                          onChange={(e) => setPostForm({...postForm, groupName: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                          placeholder="Group name (optional)"
                        />
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => setShowAddPost(false)}
                            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleAddPost}
                            disabled={!postForm.caption.trim()}
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
                          >
                            Post
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Posts Section */}
                <div className="mt-10 py-10 border-t border-blueGray-200">
                  <h4 className="text-2xl font-semibold mb-6 text-center">Posts</h4>
                  {posts.length === 0 ? (
                    <p className="text-center text-gray-500">No posts yet</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 justify-items-center">
                      {posts.map((post) => (
                        <div key={post._id} className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden w-full max-w-sm">
                          <div className="p-4">
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex items-center space-x-2">
                                <img
                                  src={post.userId.profileImage || "https://demos.creative-tim.com/notus-js/assets/img/team-2-800x800.jpg"}
                                  alt="Profile"
                                  className="w-8 h-8 rounded-full"
                                />
                                <div>
                                  <h5 className="font-semibold text-sm">{post.userId.name}</h5>
                                  <p className="text-xs text-gray-500">{new Date(post.createdAt).toLocaleDateString()}</p>
                                </div>
                              </div>
                              
                              {post.userId._id === userId && (
                                <div className="relative">
                                  <button
                                    onClick={() => setEditingPost(editingPost === post._id ? null : post._id)}
                                    className="text-gray-500 hover:text-gray-700"
                                  >
                                    ⋯
                                  </button>
                                  {editingPost === post._id && (
                                    <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                                      <button
                                        onClick={() => {
                                          setEditPostCaption(post.caption)
                                          setEditingPost(`edit-${post._id}`)
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
                              <div className="mb-2">
                                <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                  {post.groupName}
                                </span>
                              </div>
                            )}
                            
                            {editingPost === `edit-${post._id}` ? (
                              <div className="space-y-2">
                                <textarea
                                  value={editPostCaption}
                                  onChange={(e) => setEditPostCaption(e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 text-sm"
                                  rows="2"
                                />
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleEditPost(post._id)}
                                    className="bg-green-500 text-white px-3 py-1 rounded text-xs hover:bg-green-600"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={() => setEditingPost(null)}
                                    className="bg-gray-500 text-white px-3 py-1 rounded text-xs hover:bg-gray-600"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <p className="text-gray-700 text-sm mb-3">{post.caption}</p>
                            )}
                          </div>
                          
                          {post.image && (
                            <img
                              src={post.image}
                              alt="Post"
                              className="w-full h-56 object-cover"
                            />
                          )}
                          
                          {/* Post Actions */}
                          <div className="p-4 pt-3">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-1">
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
                                <div className="flex items-center space-x-1">
                                  <button 
                                    onClick={() => {
                                      setShowComments({...showComments, [post._id]: !showComments[post._id]});
                                      if (!showComments[post._id]) {
                                        setShowLikes({...showLikes, [post._id]: false});
                                      }
                                    }}
                                    className="text-gray-600 hover:text-blue-600"
                                  >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                  </button>
                                  <span className="text-sm font-medium">{post.comments?.length || 0}</span>
                                  <span className="text-sm">comments</span>
                                </div>
                              </div>
                            </div>
                            
                            {/* Show likes */}
                            {showLikes[post._id] && post.likes?.length > 0 && (
                              <div className="mb-2 p-3 bg-gray-50 rounded text-sm">
                                <p className="font-semibold mb-2">Liked by:</p>
                                <div className="space-y-2 max-h-32 overflow-y-auto">
                                  {post.likes.map((like) => (
                                    <div key={like._id} className="flex items-center space-x-2">
                                      <img 
                                        src={like.profileImage || "https://demos.creative-tim.com/notus-js/assets/img/team-2-800x800.jpg"} 
                                        alt="Profile" 
                                        className="w-6 h-6 rounded-full flex-shrink-0"
                                      />
                                      <span className="text-gray-700 font-medium">{like.name}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {/* Comments */}
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
                                
                                {/* Comments list - scrollable, max height */}
                                {post.comments?.length > 0 && (
                                  <div className="max-h-32 overflow-y-auto space-y-2">
                                    {post.comments.slice().reverse().map((comment) => (
                                      <div key={comment._id} className="flex space-x-2 text-sm">
                                        <img 
                                          src={comment.userId.profileImage || "https://demos.creative-tim.com/notus-js/assets/img/team-2-800x800.jpg"} 
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
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <footer className="relative bg-blueGray-200 pt-8 pb-6 mt-8">
            <div className="container mx-auto px-4">
              <div className="flex flex-wrap items-center md:justify-between justify-center">
                <div className="w-full md:w-6/12 px-4 mx-auto text-center">
                  <div className="text-sm text-blueGray-500 font-semibold py-1">
                    Made with <a href="https://www.creative-tim.com/product/notus-js" className="text-blueGray-500 hover:text-gray-800" target="_blank" rel="noopener noreferrer">Notus JS</a> by <a href="https://www.creative-tim.com" className="text-blueGray-500 hover:text-blueGray-800" target="_blank" rel="noopener noreferrer"> Creative Tim</a>.
                  </div>
                </div>
              </div>
            </div>
          </footer>
        </section>
      </main>
    </div>
  )
}

export default ProfilePage