import React, { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import axios from "axios";

const Chatbot_Container = ({ onClose, isMobile = false }) => {
  const url = "http://localhost:9860";
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const [chatHistory, setChatHistory] = useState([
    { sender: "bot", text: "Hello! How can I assist you today?" },
  ]);

  // Scroll to bottom when new messages come
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  const handleSubmitMessageToBot = async () => {
    if (!message.trim()) return;

    // Add user's message to chat history
    setChatHistory((prev) => [...prev, { sender: "user", text: message }]);
    const currentMessage = message;
    setMessage("");
    setLoading(true);
    
    try {
      const res = await axios.post(`${url}/bot/botreply`, { message: currentMessage });
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

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmitMessageToBot();
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#edf0f3] border border-gray-300">
      {/* Header - only show on desktop */}
      {!isMobile && (
        <div className="sticky top-0 z-10 px-4 py-2 border-b border-gray-300 bg-white shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-800">
              Chatbot Assistant
            </h3>
            {onClose && (
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 p-1"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex flex-col flex-1 overflow-y-auto p-4 space-y-4">
        {chatHistory.map((msg, index) => (
          <div
            key={index}
            className={`max-w-[60%] px-[14px] py-[10px] rounded-2xl text-[15px] break-words backdrop-blur-md flex ${
              msg.sender === "user"
                ? "self-end bg-[#5B50A7] text-white justify-end"
                : "self-start bg-[#CFD8DC] text-black justify-start"
            }`}
          >
            {msg.text}
          </div>
        ))}
        
        {loading && (
          <div className="self-start px-3 py-2 ml-4 mb-5 bg-gray-200 rounded-2xl max-w-max shadow flex items-center gap-1">
            <span className="block w-2 h-2 bg-gray-500 rounded-full animate-pulse" />
            <span className="block w-2 h-2 bg-gray-500 rounded-full animate-pulse delay-150" />
            <span className="block w-2 h-2 bg-gray-500 rounded-full animate-pulse delay-300" />
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-300 bg-transparent">
        <div className="flex items-center w-full space-x-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Message..."
            className="flex-1 w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSubmitMessageToBot}
            disabled={!message.trim()}
            className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ minWidth: "2.5rem" }}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot_Container;