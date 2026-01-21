import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

const Chatbot_Container = ({ onClose }) => {
  const url = "http://localhost:9860";
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([
    { sender: "bot", text: "Hello! How can I assist you today?" },
  ]);
  const chatDisplayRef = useRef(null);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (chatDisplayRef.current) {
      chatDisplayRef.current.scrollTop = chatDisplayRef.current.scrollHeight;
    }
  }, [chatHistory, loading]);

  const handleSubmitMessageToBot = async () => {
    if (!message.trim()) return;

    setChatHistory((prev) => [...prev, { sender: "user", text: message }]);
    setMessage("");
    setLoading(true);
    try {
      const res = await axios.post(`${url}/bot/botreply`, { message });
      setChatHistory((prev) => [
        ...prev,
        { sender: "bot", text: res.data.reply },
      ]);
    } catch (error) {
      console.log(error);
      setChatHistory((prev) => [
        ...prev,
        { sender: "bot", text: "Sorry, something went wrong." },
      ]);
    }
    setLoading(false);
  };

  return (
    // outer card: give it a fixed / screen-based height
    <div className="w-full max-w-sm h-[calc(100vh-7rem)] bg-[#232946] border-2 border-black rounded-t-2xl shadow-md overflow-hidden">
      {/* column layout so middle grows and scrolls */}
      <div className="flex flex-col h-full">
        {/* top header */}
        <div className="px-4 py-3 border-b-2 border-black">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold font-serif text-zinc-800 dark:text-white">
              Chatbot Assistant
            </h2>
            <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
              Online
            </div>
            <button
              onClick={onClose}
              className="cursor-pointer hover:bg-gray-200 rounded p-1"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* chat display – this is the ONLY scrolling area */}
        <div
          ref={chatDisplayRef}
          id="chatDisplay"
          className="flex-1 p-3 overflow-y-auto flex flex-col space-y-2 scrollbar-hide"
        >
          {chatHistory.map(({ sender, text }, index) => (
            <div
              key={index}
              className={`chat-message max-w-xs rounded-lg px-3 py-1.5 text-sm ${
                sender === "user"
                  ? "self-end bg-blue-500 text-white"
                  : "self-start bg-zinc-500 text-white"
              }`}
            >
              {text}
            </div>
          ))}

          {loading && (
            <div className="self-start px-3 py-2 bg-gray-200 rounded-2xl max-w-max shadow flex items-center gap-1">
              <span className="block w-1.5 h-1.5 bg-gray-500 rounded-full animate-pulse" />
              <span className="block w-1.5 h-1.5 bg-gray-500 rounded-full animate-pulse delay-100" />
              <span className="block w-1.5 h-1.5 bg-gray-500 rounded-full animate-pulse delay-200" />
            </div>
          )}
        </div>

        {/* message input stays fixed at bottom */}
        <div className="px-3 border-t border-black">
          <div className="flex gap-2 py-2">
            <input
              placeholder="Type your message..."
              className="flex-1 p-2 border rounded-lg bg-black dark:text-white dark:border-zinc-600 text-sm"
              id="chatInput"
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSubmitMessageToBot();
              }}
            />
            <button
              onClick={handleSubmitMessageToBot}
              type="button"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1.5 px-3 rounded-lg transition duration-300 ease-in-out text-sm"
              id="sendButton"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chatbot_Container;
