import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { colors } from "../../theme/colors";
import { Ionicons } from "@expo/vector-icons";

export default function ChatbotScreen() {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Xin chào! Tôi là trợ lý ảo SAMI. Bạn muốn hỏi gì hôm nay?" },
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    const newMsg = { sender: "user", text: input };
    setMessages((prev) => [...prev, newMsg]);

    // Giả lập phản hồi tạm thời
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Tôi đang xử lý yêu cầu của bạn..." },
      ]);
    }, 500);

    setInput("");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
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

      <ScrollView
        style={{ flex: 1, padding: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((msg, idx) => (
          <View
            key={idx}
            style={{
              alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
              backgroundColor:
                msg.sender === "user" ? colors.brand : "#F0F0F0",
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
      </ScrollView>

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
        />
        <TouchableOpacity
          onPress={handleSend}
          style={{
            backgroundColor: colors.brand,
            borderRadius: 999,
            padding: 10,
            marginLeft: 8,
          }}
        >
          <Ionicons name="send" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
