import React, { useState } from "react";
import axios from "axios";

function AddPostModal({ isOpen, onClose, onPostCreated }) {
  const [image, setImage] = useState(null);
  const [caption, setCaption] = useState("");
  const [groupName, setGroupName] = useState("");
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) return alert("Please select an image");

    setLoading(true);
    const formData = new FormData();
    formData.append('image', image);
    formData.append('caption', caption);
    if (groupName) formData.append('groupName', groupName);

    try {
      const res = await axios.post(
        "http://localhost:9860/post/create",
        formData,
        { 
          withCredentials: true,
          headers: { 'Content-Type': 'multipart/form-data' }
        }
      );
      if (res.data.success) {
        onPostCreated(res.data.post);
        setImage(null);
        setCaption("");
        setGroupName("");
        setPreview(null);
        onClose();
      }
    } catch (error) {
      alert("Failed to create post");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96">
        <h2 className="text-2xl font-bold mb-4">Add New Post</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-2 font-semibold">Select Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full border p-2 rounded"
            />
            {preview && (
              <img src={preview} alt="Preview" className="mt-2 w-full h-48 object-cover rounded" />
            )}
          </div>
          <div className="mb-4">
            <label className="block mb-2 font-semibold">Group Name (Optional)</label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full border p-2 rounded"
              placeholder="Enter group name (optional)"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2 font-semibold">Caption</label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full border p-2 rounded"
              rows="3"
              placeholder="Write a caption..."
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-pink-500 text-white py-2 rounded hover:bg-pink-600 disabled:bg-gray-400"
            >
              {loading ? "Posting..." : "Post"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 py-2 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddPostModal;
