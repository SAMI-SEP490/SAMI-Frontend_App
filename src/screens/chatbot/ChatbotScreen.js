// src/screens/chatbot/ChatbotScreen.js
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { colors } from "../../theme/colors";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../../auth";
import {
  getOpening,
  // getSuggested, // sẽ dùng sau nếu anh muốn gợi ý câu hỏi
  openChatStream,
} from "../../service/chatbot";

export default function ChatbotScreen() {
  const { user, token } = useAuthStore();

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
        const opening =
          data?.opening_statement ||
          "Xin chào! Tôi là SAMI Assistant. Bạn cần hỗ trợ gì hôm nay?";

        setMessages([{ sender: "bot", text: opening }]);
      } catch (error) {
        console.log("[Chatbot] Lỗi load opening:", error);
        setMessages([
          {
            sender: "bot",
            text: "Xin chào! Tôi là SAMI Assistant. Hiện tại tôi không lấy được câu chào từ server, nhưng bạn vẫn có thể hỏi tôi bất cứ điều gì về căn hộ, hóa đơn, hợp đồng, v.v.",
          },
        ]);
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

  // ====== Gửi tin nhắn ======
  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    if (!token) {
      console.warn("[Chatbot] Thiếu token, vui lòng đăng nhập lại.");
      return;
    }

    // DEBUG (nếu anh cần xem ở console Metro)
    console.log("===== CHATBOT DEBUG - token from useAuthStore =====");
    console.log("token:", token);

    // 1. Hiển thị tin nhắn user lên UI ngay lập tức
    const userMsg = { sender: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    setStreamingText("");

    // 2. Nếu đang có stream cũ, đóng lại
    if (eventSourceRef.current) {
      try {
        eventSourceRef.current.close();
      } catch {}
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
        } catch {}
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

  // ====== (Optional) Lấy suggested questions sau 1 message ======
  // const fetchSuggestedQuestions = async (messageId) => {
  //   try {
  //     const questions = await getSuggested(messageId);
  //     setSuggestedQuestions(questions || []);
  //   } catch (error) {
  //     console.log("[Chatbot] Lỗi lấy suggested questions:", error);
  //   }
  // };

  // ====== Render UI ======

  if (initializing) {
    return (
      <SafeAreaView
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
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F5F5F5" }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
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

        {/* Nội dung chat */}
        <ScrollView
          ref={scrollViewRef}
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

          {/* Tin nhắn bot đang stream dở */}
          {streamingText ? (
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
              <Text style={{ color: colors.text, fontSize: 14 }}>
                {streamingText}
              </Text>
            </View>
          ) : null}

          {/* Loading nhỏ nhỏ phía dưới (optional) */}
          {loading && !streamingText && (
            <View
              style={{
                alignSelf: "flex-start",
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <ActivityIndicator size="small" color={colors.brand} />
              <Text style={{ marginLeft: 8, color: colors.text }}>
                SAMI bot đang trả lời...
              </Text>
            </View>
          )}

          {/* (Optional) Gợi ý câu hỏi */}
          {/* {suggestedQuestions.length > 0 && (
            <View style={{ marginTop: 12, flexDirection: "row", flexWrap: "wrap" }}>
              {suggestedQuestions.map((q, idx) => (
                <TouchableOpacity
                  key={idx}
                  onPress={() => setInput(q)}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 999,
                    backgroundColor: "white",
                    borderWidth: 1,
                    borderColor: colors.border,
                    marginRight: 8,
                    marginBottom: 8,
                  }}
                >
                  <Text style={{ fontSize: 13, color: colors.text }}>{q}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )} */}
        </ScrollView>

        {/* Ô nhập tin nhắn */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 16,
            paddingVertical: 10,
            backgroundColor: "#fff",
            borderTopWidth: 1,
            borderTopColor: "#eee",
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
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
