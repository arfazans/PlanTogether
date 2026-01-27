import React, { useState, useEffect } from "react";
import axios from "axios";

const Posts = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetchPosts();
  }, []);

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

  const handleLike = (postId) => {
    setPosts(posts.map(post => 
      post._id === postId ? { ...post, likes: post.likes + 1 } : post
    ));
  };

  const handleComment = (postId) => {
    setPosts(posts.map(post => 
      post._id === postId ? { ...post, comments: post.comments + 1 } : post
    ));
  };

  return (
    <div className="w-full h-full overflow-y-auto p-4">
      {posts.length === 0 ? (
        <div className="text-center text-gray-500 mt-10">
          <h2 className="text-2xl">No posts yet</h2>
          <p>Be the first to share something!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div key={post._id} className="bg-white rounded-lg shadow-md max-w-2xl mx-auto">
              <div className="post-header bg-black flex text-white border-2 p-3 gap-4">
                <h3 className="font-semibold">{post.userName}</h3>
                {post.groupName && <h3 className="font-semibold">{post.groupName}</h3>}
              </div>
              <div className="post-content">
                <img src={post.image} alt="Post" className="w-full h-96 object-cover" />
                {post.caption && (
                  <p className="p-4 text-gray-800">{post.caption}</p>
                )}
              </div>
              <div className="post-actions flex p-3 gap-6 bg-black text-white border-white border-2">
                <div>
                  <button onClick={() => handleLike(post._id)}>Like</button>
                  <span className="text-red-600 ml-2">{post.likes}</span>
                </div>
                <div>
                  <button onClick={() => handleComment(post._id)}>Comment</button>
                  <span className="text-red-600 ml-2">{post.comments}</span>
                </div>
                <div>
                  <button>Share</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default Posts;


