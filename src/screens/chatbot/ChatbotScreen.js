// src/screens/chatbot/ChatbotScreen.js
import React, { useState } from "react";
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
import { sendChatToDify } from "../../service/difyClient";

export default function ChatbotScreen() {
  const { user } = useAuthStore(); // lấy user đang đăng nhập (tenant)
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Xin chào! Tôi là trợ lý ảo SAMI. Bạn muốn hỏi gì hôm nay?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    // 1. Push tin nhắn user lên UI trước cho mượt
    const userMsg = { sender: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      // 2. Gọi API Dify
      const data = await sendChatToDify({
        query: text,
        userId: user?.id ? String(user.id) : "tenant-app-user",
        conversationId,
      });

      const answer =
        data?.answer || "Xin lỗi, tôi chưa nhận được câu trả lời từ trợ lý ảo.";

      // 3. Lưu lại conversation_id để các câu sau Dify nhớ context
      if (data?.conversation_id) {
        setConversationId(data.conversation_id);
      }

      // 4. Push tin nhắn bot
      const botMsg = { sender: "bot", text: answer };
      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      const errorMsg =
        error?.message || "Đã xảy ra lỗi khi gọi trợ lý ảo. Vui lòng thử lại.";
      setMessages((prev) => [...prev, { sender: "bot", text: errorMsg }]);
    } finally {
      setLoading(false);
    }
  };

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

        {/* Loading indicator khi đợi AI trả lời */}
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

      {/* Ô nhập + nút gửi */}
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
