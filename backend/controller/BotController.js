const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const chatWithBot = async (req, res) => {
  try {
    const { message } = req.body;
    console.log("Received message:", message);

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // Try with gemini-1.5-flash (without -8b)
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(message);
    const response = await result.response;
    const replyText = response.text();

    console.log("Reply text:", replyText);
    res.json({ reply: replyText });

  } catch (error) {
    console.error("API Error:", error.message);

    // Fallback to mock response if API fails
    const mockResponses = [
      "I'm here to help! What would you like to know?",
      "That's an interesting question. Let me think about that.",
      "I understand your concern. How can I assist you further?",
      "Thank you for your message. I'm processing your request.",
      "I'm a chatbot assistant. Feel free to ask me anything!"
    ];

    const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];
    res.json({ reply: randomResponse });
  }
};

module.exports = { chatWithBot };