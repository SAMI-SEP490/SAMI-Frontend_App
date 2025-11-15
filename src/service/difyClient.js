// src/service/difyClient.js
import axios from "axios";

// Lấy từ .env (Expo tự map vào process.env.*)
const DIFY_API_URL =
  process.env.EXPO_PUBLIC_DIFY_API_URL || "https://api.dify.ai/v1/chat-messages";

const DIFY_API_KEY = process.env.EXPO_PUBLIC_DIFY_API_KEY;

/**
 * Hàm gọi Dify để gửi câu hỏi chat
 * @param {object} params
 * @param {string} params.query        - Câu hỏi người dùng
 * @param {string} params.userId       - ID user (tenant)
 * @param {string|null} params.conversationId - conversation_id để Dify nhớ ngữ cảnh
 */
export async function sendChatToDify({ query, userId, conversationId = null }) {
  if (!DIFY_API_KEY) {
    throw new Error(
      "Thiếu DIFY_API_KEY. Hãy kiểm tra file .env (EXPO_PUBLIC_DIFY_API_KEY)."
    );
  }

  const body = {
    query,
    user: userId || "tenant-app-user", // Dify dùng 'user' để group hội thoại
    inputs: {},                        // nếu trong Dify app có biến thì truyền ở đây
    response_mode: "blocking",         // trả về 1 lần, dễ dùng cho mobile :contentReference[oaicite:0]{index=0}
  };

  if (conversationId) {
    body.conversation_id = conversationId;
  }

  const res = await axios.post(DIFY_API_URL, body, {
    headers: {
      Authorization: `Bearer ${DIFY_API_KEY}`, // Bearer {API_KEY} :contentReference[oaicite:1]{index=1}
      "Content-Type": "application/json",
    },
  });

  // Theo docs, response sẽ có dạng:
  // { event: 'message', answer: '...', conversation_id: '...', ... } :contentReference[oaicite:2]{index=2}
  return res.data;
}
