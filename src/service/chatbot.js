// src/service/chatbot.js
import EventSource from "react-native-sse";
import { http, baseURL } from "./http";

/**
 * Lấy câu chào + câu hỏi gợi ý mở đầu từ backend
 * GET /api/chatbot/opening
 */
export async function getOpening() {
  const res = await http.get("/chatbot/opening");
  // Backend trả dạng: { success: true, data: { opening_statement, suggested_questions } }
  return res.data?.data || {};
}

/**
 * Lấy câu hỏi gợi ý tiếp theo sau 1 message
 * GET /api/chatbot/suggested/:messageId
 */
export async function getSuggested(messageId) {
  if (!messageId) return [];
  const res = await http.get(`/chatbot/suggested/${messageId}`);
  // Backend trả dạng: { success: true, data: [...] }
  return res.data?.data || [];
}

/**
 * Mở stream chat tới backend /api/chatbot/chat
 * Dùng SSE để nhận dữ liệu từng chunk
 */
export function openChatStream({ prompt, conversationId = null, token }) {
  if (!prompt) {
    throw new Error("Thiếu prompt để gửi cho chatbot.");
  }
  if (!token) {
    throw new Error("Thiếu token người dùng. Vui lòng đăng nhập lại.");
  }

  const url = `${baseURL}/chatbot/chat`; // baseURL đã có /api sẵn rồi

  // react-native-sse API: new EventSource(url, { method, headers, body })
  const es = new EventSource(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "text/event-stream",
    },
    body: JSON.stringify({
      prompt,
      // BE chỉ gửi conversation_id nếu có, null là chat mới
      conversation_id: conversationId ?? null,
    }),
  });

  return es;
}
