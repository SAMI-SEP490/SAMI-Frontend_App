// src/screens/chatbot/ChatbotScreen.js
import { useFocusEffect } from "@react-navigation/native";
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../../theme/colors";
import { Ionicons } from "@expo/vector-icons";
import Markdown from "react-native-markdown-display";
import { useAuthStore } from "../../auth";
import {
  getOpening,
  getSuggested,
  openChatStream,
} from "../../service/chatbot";

export default function ChatbotScreen() {
  const { user, token } = useAuthStore();
  const [suggestedQuestions, setSuggestedQuestions] = useState([]);

  const [messages, setMessages] = useState([]); // { sender: "user" | "bot", text: string }
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [initializing, setInitializing] = useState(true);

  // Text bot đang stream dở
  const [streamingText, setStreamingText] = useState("");
  // const [suggestedQuestions, setSuggestedQuestions] = useState([]);

  const scrollViewRef = useRef(null);
  const eventSourceRef = useRef(null);

  // ====== Load câu chào mở đầu từ backend (/api/chatbot/opening) ======
  useEffect(() => {
    const loadOpening = async () => {
      try {
        const data = await getOpening();
        const opening = data?.opening_statement;
        const suggested = data?.suggested_questions || [];
        setMessages([{ sender: "bot", text: opening }]);
        setSuggestedQuestions(suggested);
      } catch (err) {
        console.log(err);
      } finally {
        setInitializing(false);
      }
    };
    loadOpening();

    // cleanup: đóng stream nếu màn hình bị unmount
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, []);

  // ====== Auto scroll mỗi khi có tin nhắn mới hoặc bot đang stream ======
  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [messages, streamingText]);
  useFocusEffect(
    React.useCallback(() => {
      setTimeout(() => {
        if (scrollViewRef.current) {
          scrollViewRef.current.scrollToEnd({ animated: false });
        }
      }, 50);

      // Cleanup khi rời màn hình
      return () => {
        if (eventSourceRef.current) {
          eventSourceRef.current.close();
          eventSourceRef.current = null;
        }
      };
    }, [])
  );
  // ====== Gửi tin nhắn ======
  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    if (!token) {
      console.warn("[Chatbot] Thiếu token, vui lòng đăng nhập lại.");
      return;
    }

    // DEBUG
    console.log("===== CHATBOT DEBUG - token from useAuthStore =====");
    console.log("token:", token);

    // 1. Hiển thị tin nhắn user lên UI ngay lập tức
    const userMsg = { sender: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setStreamingText("");
    setLoading(true);
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 80);
    // 2. Nếu đang có stream cũ, đóng lại
    if (eventSourceRef.current) {
      try {
        eventSourceRef.current.close();
      } catch { }
      eventSourceRef.current = null;
    }

    try {
      // 3. Mở kết nối SSE tới backend
      const es = openChatStream({
        prompt: text,
        conversationId,
        token,
      });

      eventSourceRef.current = es;

      let fullBotResponse = "";
      let newConversationId = conversationId;
      let lastMessageId = null;

      es.addEventListener("message", (event) => {
        if (!event.data) return;

        try {
          const data = JSON.parse(event.data);

          // Dify stream structure: data.event: "message" | "agent_message" | "message_end" | ...
          if (
            data.event === "message" ||
            data.event === "agent_message" ||
            data.event === "assistant_message"
          ) {
            const chunk = data.answer || "";
            fullBotResponse += chunk;
            setStreamingText(fullBotResponse);
          }

          if (data.event === "message_end") {
            // conversation_id mới
            if (data.conversation_id) {
              newConversationId = data.conversation_id;
              setConversationId(data.conversation_id);
            } else if (data.conversation?.id) {
              newConversationId = data.conversation.id;
              setConversationId(data.conversation.id);
            }

            // id message để sau này gọi /suggested/:messageId nếu cần
            lastMessageId =
              data.message_id || data.id || data.result_message_id || null;

            // Nếu vì lý do gì đó fullBotResponse rỗng, dùng answer cuối
            if (!fullBotResponse && data.answer) {
              fullBotResponse = data.answer;
            }

            // Đẩy tin nhắn bot hoàn chỉnh vào messages
            const botMsg = {
              sender: "bot",
              text:
                fullBotResponse ||
                "Xin lỗi, tôi chưa nhận được câu trả lời từ trợ lý ảo.",
            };

            setMessages((prev) => [...prev, botMsg]);
            setStreamingText("");
            setLoading(false);

            // TODO: nếu muốn, anh có thể bật đoạn này để lấy suggested questions:
            // if (lastMessageId) {
            //   fetchSuggestedQuestions(lastMessageId);
            // }
            if (lastMessageId) {
              fetchSuggestedQuestions(lastMessageId);
            }
            es.close();
            eventSourceRef.current = null;
          }

          if (data.event === "error") {
            console.error("[Chatbot SSE] error event:", data);
          }
        } catch (e) {
          console.error("[Chatbot SSE] Parse error:", e);
        }
      });

      es.addEventListener("error", (event) => {
        console.error("[Chatbot SSE] Error event:", event);
        setLoading(false);
        setStreamingText("");
        try {
          es.close();
        } catch { }
        eventSourceRef.current = null;
      });
    } catch (error) {
      console.error("[Chatbot] Lỗi khi mở stream:", error);
      setLoading(false);
      setStreamingText("");

      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "Đã xảy ra lỗi khi gọi SAMI Assistant. Vui lòng thử lại sau ít phút.",
        },
      ]);
    }
  };
  const handleSendFromSuggestion = (q) => {
    setInput(q);
    handleSend(q);
  };
  const fetchSuggestedQuestions = async (messageId) => {
    try {
      const questions = await getSuggested(messageId);
      setSuggestedQuestions(questions || []);
    } catch (error) {
      console.log("[Chatbot] Lỗi lấy suggested:", error);
    }
  };

  if (initializing) {
    return (
      <SafeAreaView
        edges={["top", "left", "right"]}
        style={{
          flex: 1,
          backgroundColor: "#fff",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color={colors.brand} />
        <Text style={{ marginTop: 12, color: colors.text }}>
          Đang khởi tạo SAMI Assistant...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
  style={{ flex: 1, backgroundColor: "#F5F5F5" }}
  edges={[ 'left', 'right']}
>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={80}
      >
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 16,
            paddingVertical: 12,
            backgroundColor: "#fff",
            borderBottomWidth: 1,
            borderBottomColor: "#eee",
          }}
        >
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: colors.brand,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Ionicons name="chatbubbles-outline" size={22} color="#fff" />
          </View>
          <Text
            style={{
              fontSize: 18,
              fontWeight: "700",
              marginLeft: 10,
              color: colors.text,
            }}
          >
            SAMI bot
          </Text>
        </View>

        {/* Scroll messages */}
        <KeyboardAwareScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
          ref={scrollViewRef}
          keyboardShouldPersistTaps="handled"
          extraScrollHeight={60}
          enableOnAndroid={true}
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
              <Markdown
                style={{
                  body: {
                    color: msg.sender === "user" ? "#fff" : colors.text,
                    fontSize: 14,
                  },
                }}
              >
                {msg.text}
              </Markdown>
            </View>
          ))}

          {/* 🔹 Hiện tin nhắn bot đang stream dở */}
          {streamingText !== "" && (
            <View
              style={{
                alignSelf: "flex-start",
                backgroundColor: "#F0F0F0",
                padding: 12,
                borderRadius: 18,
                marginBottom: 8,
                maxWidth: "80%",
              }}
            >
              <Markdown
                style={{
                  body: {
                    color: colors.text,
                    fontSize: 14,
                  },
                }}
              >
                {streamingText}
              </Markdown>
            </View>
          )}

          {/* 🔹 Khi chưa có streamingText nhưng loading */}
          {loading && streamingText === "" && (
            <View
              style={{
                alignSelf: "flex-start",
                backgroundColor: "#F0F0F0",
                padding: 12,
                borderRadius: 18,
                marginBottom: 8,
                maxWidth: "80%",
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <ActivityIndicator size="small" style={{ marginRight: 8 }} />
              <Text style={{ color: colors.text }}>Đang trả lời...</Text>
            </View>
          )}
        </KeyboardAwareScrollView>

        {/* suggested */}
        {suggestedQuestions.length > 0 && (
          <View style={{ paddingHorizontal: 12, marginBottom: 6 }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {suggestedQuestions.map((q, i) => (
                <TouchableOpacity
                  key={i}
                  onPress={() => handleSendFromSuggestion(q)}
                  style={{
                    backgroundColor: "#fff",
                    paddingVertical: 8,
                    paddingHorizontal: 14,
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: "#ddd",
                    marginRight: 8,
                  }}
                >
                  <Text style={{ color: "#333" }}>{q}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Input */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            padding: 12,
            backgroundColor: "#fff",
            borderTopWidth: 1,
            borderTopColor: "#eee",
          }}
        >
          <TextInput
            style={{
              flex: 1,
              backgroundColor: "#fff",
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
            }}
          >
            <Ionicons name="send" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );



}
