import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

const CleanChatbot = () => {
  const url = "http://localhost:9860";
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([
    { sender: "bot", text: "Hello! How can I assist you today?" },
  ]);
  const chatDisplayRef = useRef(null);

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
    <div className="w-full h-full bg-[#edf0f3] flex flex-col">
      {/* Chat display */}
      <div
        ref={chatDisplayRef}
        className="flex-1 p-4 overflow-y-auto flex flex-col space-y-3"
      >
        {chatHistory.map(({ sender, text }, index) => (
          <div
            key={index}
            className={`max-w-xs rounded-lg px-3 py-2 text-sm ${
              sender === "user"
                ? "self-end bg-blue-500 text-white"
                : "self-start bg-gray-200 text-gray-800"
            }`}
          >
            {text}
          </div>
        ))}

        {loading && (
          <div className="self-start px-3 py-2 bg-gray-200 rounded-lg max-w-max flex items-center gap-1">
            <span className="block w-1.5 h-1.5 bg-gray-500 rounded-full animate-pulse" />
            <span className="block w-1.5 h-1.5 bg-gray-500 rounded-full animate-pulse delay-100" />
            <span className="block w-1.5 h-1.5 bg-gray-500 rounded-full animate-pulse delay-200" />
          </div>
        )}
      </div>

      {/* Message input */}
      <div className="p-4 border-t border-gray-300">
        <div className="flex gap-2">
          <input
            placeholder="Type your message..."
            className="flex-1 p-2 border border-gray-300 rounded-lg bg-white text-sm"
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
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg text-sm"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default CleanChatbot;