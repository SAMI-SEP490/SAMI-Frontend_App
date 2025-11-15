// src/service/difyClient.js
import axios from "axios";

const DIFY_API_URL =
  process.env.EXPO_PUBLIC_DIFY_API_URL ||
  "https://api.dify.ai/v1/chat-messages";

const DIFY_API_KEY = process.env.EXPO_PUBLIC_DIFY_API_KEY;

/**
 * Gửi tin nhắn chat tới Dify (Agent Chat App)
 * - Agent chỉ hỗ trợ response_mode = "streaming"
 * - Ghép các chunk trong stream thành 1 câu trả lời đầy đủ
 */
export async function sendChatToDify({
  query,
  userId,
  userToken,
  conversationId = null,
}) {
  if (!DIFY_API_KEY) {
    throw new Error(
      "Thiếu DIFY_API_KEY. Hãy kiểm tra file .env (EXPO_PUBLIC_DIFY_API_KEY)."
    );
  }

  // DEBUG: in ra token để kiểm tra format
  console.log("===== DIFY DEBUG - TOKEN =====");
  console.log("Token typeof:", typeof userToken);
  console.log("Token value:", userToken);
  if (userToken) {
    console.log("Token length:", String(userToken).length);
  } else {
    console.log("Token is EMPTY / UNDEFINED");
  }

  const body = {
    query,
    user: userId || "tenant-app-user",

    // 🔥 gửi đúng input mà Dify yêu cầu
    inputs: {
      tenant_jwt_token: userToken ?? "",
    },

    response_mode: "streaming", // Agent không cho dùng blocking
  };

  console.log("===== DIFY DEBUG - BODY =====");
  console.log(JSON.stringify(body, null, 2));

  if (conversationId) {
    body.conversation_id = conversationId;
  }

  try {
    const res = await axios.post(DIFY_API_URL, body, {
      headers: {
        Authorization: `Bearer ${DIFY_API_KEY}`,
        "Content-Type": "application/json",
      },
      responseType: "text", // streaming => text/event-stream
    });

    const text = String(res.data || "");

    console.log("===== DIFY RAW STREAM (first 500 chars) =====");
    console.log(text.slice(0, 500));

    let fullAnswer = "";
    let newConversationId = conversationId || null;

    const lines = text.split("\n");
    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line || !line.startsWith("data:")) continue;

      const jsonStr = line.replace(/^data:\s*/, "");
      if (jsonStr === "[DONE]") continue;

      try {
        const obj = JSON.parse(jsonStr);

        const isAnswerEvent =
          obj.event === "agent_message" || obj.event === "message";

        if (isAnswerEvent && typeof obj.answer === "string") {
          fullAnswer += obj.answer;
        }

        if (obj.conversation_id) {
          newConversationId = obj.conversation_id;
        }
      } catch (e) {
        console.log("Cannot parse Dify line:", jsonStr);
      }
    }

    if (!fullAnswer) {
      fullAnswer = "Trợ lý ảo không trả lời nội dung nào.";
    }

    return {
      answer: fullAnswer,
      conversation_id: newConversationId,
    };
  } catch (error) {
    if (error.response) {
      console.log("===== DIFY ERROR =====");
      console.log("Status:", error.response.status);
      console.log("Data:", error.response.data);

      throw {
        isDifyError: true,
        status: error.response.status,
        data: error.response.data,
      };
    }

    throw error;
  }
}

/** Lấy parameters (opening_statement, v.v.) */
export async function getDifyParameters() {
  try {
    const res = await axios.get("https://api.dify.ai/v1/parameters", {
      headers: {
        Authorization: `Bearer ${DIFY_API_KEY}`,
      },
    });

    return res.data;
  } catch (error) {
    console.log("===== DIFY PARAM ERROR =====");
    if (error.response) {
      console.log(error.response.data);
    }
    return null;
  }
}
