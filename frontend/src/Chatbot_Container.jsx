import React, { useState } from "react";
import axios from "axios";

const Chatbot_Container = ({ onClose }) => {
  const url = "http://localhost:9860";
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false); // ← Track if bot is "typing"

  const [chatHistory, setChatHistory] = useState([
    { sender: "bot", text: "Hello! How can I assist you today?" },
  ]);

  const handleSubmitMessageToBot = async () => {
    if (!message.trim()) return;

    // Add user's message to chat history
    setChatHistory((prev) => [...prev, { sender: "user", text: message }]);
    setMessage(""); // ← input clears right after send
    setLoading(true); // ← start bot-typing
    try {
      // POST message and user to backend botreply endpoint
      const res = await axios.post(`${url}/bot/botreply`, { message: message });

      // Add Bot Libre's reply to chat history
      setChatHistory((prev) => [
        ...prev,
        { sender: "bot", text: res.data.reply },
      ]);
    } catch (error) {
      console.log(error);
      // Show error message from bot
      setChatHistory((prev) => [
        ...prev,
        { sender: "bot", text: "Sorry, something went wrong." },
      ]);
    }
    setLoading(false); // ← stop bot-typing after response
  };

  return (
    <div className="max-w-md mx-auto h-full bg-transparent border-2 border-black rounded-t-2xl shadow-md rounded-lg overflow-hidden">
      <div className="flex flex-col h-full pb-2.5">
        <div className="px-4 py-3 border-b-2  border-black">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-zinc-800 dark:text-white">
              Chatbot Assistant
            </h2>
            <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
              Online
            </div>

            {/* cross button */}
            <div
              onClick={onClose}
              className="cursor-pointer hover:bg-gray-400 rounded"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </div>
          </div>
        </div>

        {/* Chat display */}
        <div
          className="flex-1 p-3 overflow-y-auto flex flex-col space-y-2"
          id="chatDisplay"
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
          {/* Typing indicator at the end */}
          {loading && (
            <div className="self-start px-3 py-2 bg-gray-200 rounded-2xl max-w-max shadow flex items-center gap-1">
              <span className="block w-1.5 h-1.5 bg-gray-500 rounded-full animate-pulse" />
              <span className="block w-1.5 h-1.5 bg-gray-500 rounded-full animate-pulse delay-100" />
              <span className="block w-1.5 h-1.5 bg-gray-500 rounded-full animate-pulse delay-200" />
            </div>
          )}
        </div>

        {/* Message input */}
        <div className="px-3 py-2 border-t border-black">
          <div className="flex gap-2">
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
