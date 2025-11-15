import React, { createContext, useState } from "react";
import { askChatbot } from "../services/api/chatbot";

export const ChatbotContext = createContext();

export const ChatbotProvider = ({ children }) => {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Xin chào! Tôi có thể giúp gì cho bạn hôm nay?" },
  ]);

  const addMessage = (message) => setMessages((prev) => [...prev, message]);

  const sendMessage = async (text) => {
    addMessage({ sender: "user", text });
    try {
      const response = await askChatbot(text);
      addMessage({ sender: "bot", text: response.answer });
    } catch (error) {
      addMessage({ sender: "bot", text: "❗Đã xảy ra lỗi, vui lòng thử lại." });
    }
  };

  return (
    <ChatbotContext.Provider value={{ messages, addMessage, sendMessage }}>
      {children}
    </ChatbotContext.Provider>
  );
};