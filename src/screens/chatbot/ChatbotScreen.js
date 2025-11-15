// src/screens/chatbot/ChatbotScreen.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { colors } from "../../theme/colors";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../../auth";
import { sendChatToDify, getDifyParameters } from "../../service/difyClient";

export default function ChatbotScreen() {
  const { user, token } = useAuthStore(); // 🔥 lấy cả token ở đây

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [initializing, setInitializing] = useState(true);

  // Load câu chào từ Dify
  useEffect(() => {
    const loadOpening = async () => {
      const params = await getDifyParameters();
      const opening =
        params?.opening_statement ||
        "Xin chào! Tôi là SAMI Bot. Bạn cần hỗ trợ gì?";

      setMessages([{ sender: "bot", text: opening }]);
      setInitializing(false);
    };

    loadOpening();
  }, []);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    // DEBUG: in ra token ở phía UI luôn
    console.log("===== CHATBOT DEBUG - token from useAuthStore =====");
    console.log("token:", token);

    const userMsg = { sender: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const data = await sendChatToDify({
        query: text,
        userId: user?.id ? String(user.id) : "tenant-app-user",
        userToken: token, // 🔥 gửi token vào inputs.tenant_jwt_token
        conversationId,
      });

      const answer =
        data?.answer || "Xin lỗi, tôi chưa nhận được câu trả lời từ trợ lý ảo.";

      if (data?.conversation_id) {
        setConversationId(data.conversation_id);
      }

      const botMsg = { sender: "bot", text: answer };
      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      let errorText = "Đã xảy ra lỗi khi gọi trợ lý ảo. Vui lòng thử lại.";

      if (error?.isDifyError) {
        const { status, data } = error;
        const detail =
          data?.message || data?.error || JSON.stringify(data, null, 2);
        errorText = `Lỗi từ Dify (HTTP ${status}): ${detail}`;
      } else if (error?.message) {
        errorText = error.message;
      }

      setMessages((prev) => [...prev, { sender: "bot", text: errorText }]);
    } finally {
      setLoading(false);
    }
  };

  if (initializing) {
    return (
      <SafeAreaView
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <ActivityIndicator size="large" color={colors.brand} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          padding: 16,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <Ionicons name="chatbubbles-outline" size={24} color={colors.brand} />
        <Text
          style={{
            fontSize: 18,
            fontWeight: "700",
            marginLeft: 10,
            color: colors.text,
          }}
        >
          Trợ lý ảo
        </Text>
      </View>

      {/* Nội dung chat */}
      <ScrollView
        style={{ flex: 1, padding: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((msg, idx) => (
          <View
            key={idx}
            style={{
              alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
              backgroundColor: msg.sender === "user" ? colors.brand : "#F0F0F0",
              padding: 12,
              borderRadius: 18,
              marginBottom: 8,
              maxWidth: "80%",
            }}
          >
            <Text
              style={{
                color: msg.sender === "user" ? "white" : colors.text,
                fontSize: 14,
              }}
            >
              {msg.text}
            </Text>
          </View>
        ))}

        {loading && (
          <View
            style={{
              alignSelf: "flex-start",
              flexDirection: "row",
              alignItems: "center",
              marginTop: 4,
            }}
          >
            <ActivityIndicator size="small" color={colors.brand} />
            <Text style={{ marginLeft: 8, color: colors.text }}>
              Trợ lý ảo đang trả lời...
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Input */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          padding: 12,
          borderTopWidth: 1,
          borderTopColor: colors.border,
        }}
      >
        <TextInput
          style={{
            flex: 1,
            backgroundColor: "white",
            borderRadius: 25,
            paddingHorizontal: 16,
            paddingVertical: 10,
            borderWidth: 1,
            borderColor: colors.border,
          }}
          placeholder="Nhập câu hỏi..."
          value={input}
          onChangeText={setInput}
          editable={!loading}
        />
        <TouchableOpacity
          onPress={handleSend}
          disabled={loading}
          style={{
            backgroundColor: loading ? "#999" : colors.brand,
            borderRadius: 999,
            padding: 10,
            marginLeft: 8,
            opacity: loading ? 0.7 : 1,
          }}
        >
          <Ionicons name="send" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
