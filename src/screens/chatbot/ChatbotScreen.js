import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  ActivityIndicator,
  Platform
} from "react-native";
// FIX: Use modern keyboard controller
import { KeyboardProvider, KeyboardAvoidingView } from "react-native-keyboard-controller"; 
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
import { Ionicons } from "@expo/vector-icons";
import Markdown from "react-native-markdown-display";
import { useAuthStore } from "../../auth";
import Header from "../../components/Header"; 
import {
  getOpening,
  getSuggested,
  openChatStream,
} from "../../service/chatbot";

// --- Pulsing Dots Indicator ---
const TypingIndicator = () => {
  const [opacity1] = useState(new Animated.Value(0.3));
  const [opacity2] = useState(new Animated.Value(0.3));
  const [opacity3] = useState(new Animated.Value(0.3));

  useEffect(() => {
    const animate = (anim, delay) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1,
            duration: 500,
            delay: delay,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
          Animated.timing(anim, {
            toValue: 0.3,
            duration: 500,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
        ])
      ).start();
    };

    animate(opacity1, 0);
    animate(opacity2, 200);
    animate(opacity3, 400);
  }, []);

  return (
    <View style={styles.typingContainer}>
      <Animated.View style={[styles.dot, { opacity: opacity1 }]} />
      <Animated.View style={[styles.dot, { opacity: opacity2 }]} />
      <Animated.View style={[styles.dot, { opacity: opacity3 }]} />
    </View>
  );
};

export default function ChatbotScreen() {
  const { token } = useAuthStore();
  
  const [messages, setMessages] = useState([]); 
  const [suggestedQuestions, setSuggestedQuestions] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [streamingText, setStreamingText] = useState("");

  const scrollViewRef = useRef(null);
  const eventSourceRef = useRef(null);

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

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, []);

  const scrollToBottom = (animated = true) => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingText, loading]);

  const handleSend = async (manualText = null) => {
    const text = (typeof manualText === 'string' ? manualText : input).trim();
    
    if (!text || loading) return;
    if (!token) return;

    const userMsg = { sender: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setStreamingText("");
    setLoading(true);
    
    if (eventSourceRef.current) {
      try { eventSourceRef.current.close(); } catch { }
      eventSourceRef.current = null;
    }

    try {
      const es = openChatStream({
        prompt: text,
        conversationId,
        token,
      });

      eventSourceRef.current = es;

      let fullBotResponse = "";
      let lastMessageId = null;

      es.addEventListener("message", (event) => {
        if (!event.data) return;
        try {
          const data = JSON.parse(event.data);

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
            if (data.conversation_id) setConversationId(data.conversation_id);
            else if (data.conversation?.id) setConversationId(data.conversation.id);

            lastMessageId = data.message_id || data.id || null;

            if (!fullBotResponse && data.answer) fullBotResponse = data.answer;

            const botMsg = {
              sender: "bot",
              text: fullBotResponse || "Xin lỗi, tôi không có câu trả lời.",
            };

            setMessages((prev) => [...prev, botMsg]);
            setStreamingText("");
            setLoading(false);

            if (lastMessageId) fetchSuggestedQuestions(lastMessageId);
            
            es.close();
            eventSourceRef.current = null;
          }
        } catch (e) {
          console.error("Parse error:", e);
        }
      });

      es.addEventListener("error", (event) => {
        setLoading(false);
        setStreamingText("");
        try { es.close(); } catch { }
        eventSourceRef.current = null;
      });
    } catch (error) {
      setLoading(false);
      setStreamingText("");
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Lỗi kết nối. Vui lòng thử lại." },
      ]);
    }
  };

  const fetchSuggestedQuestions = async (messageId) => {
    try {
      const questions = await getSuggested(messageId);
      setSuggestedQuestions(questions || []);
    } catch (error) {
      console.log("Suggested error:", error);
    }
  };

  if (initializing) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="white" />
        <Text style={{ marginTop: 12, color: "white", fontWeight: '600' }}>Đang kết nối SAMI...</Text>
      </View>
    );
  }

  return (
    // FIX 1: Wrap in KeyboardProvider
    <KeyboardProvider>
      <View style={styles.container}>
        <Header title="Trợ lý ảo SAMI" isHome={false} />

        {/* Gray Content Sheet */}
        <View style={styles.sheetContainer}>
            
            {/* FIX 2: Use KeyboardAvoidingView from the library 
                behavior="padding" works perfectly with this lib on Android 
                keyboardVerticalOffset handles the Header overlap
            */}
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "padding"}
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 80}
            >
                <View style={{ flex: 1 }}>
                    <ScrollView
                        ref={scrollViewRef}
                        contentContainerStyle={{ padding: spacing.md, paddingBottom: 20 }}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                        onContentSizeChange={() => scrollToBottom(true)}
                    >
                        {messages.map((msg, idx) => (
                            <View key={idx} style={[
                                styles.msgRow, 
                                msg.sender === "user" ? styles.msgRowUser : styles.msgRowBot
                            ]}>
                                {msg.sender === "bot" && (
                                    <View style={styles.botAvatar}>
                                        <Ionicons name="sparkles" size={16} color="white" />
                                    </View>
                                )}

                                <View style={[
                                    styles.bubble,
                                    msg.sender === "user" ? styles.bubbleUser : styles.bubbleBot
                                ]}>
                                    <Markdown style={msg.sender === "user" ? markdownStylesUser : markdownStylesBot}>
                                        {msg.text}
                                    </Markdown>
                                </View>
                            </View>
                        ))}

                        {/* Streaming Text */}
                        {streamingText !== "" && (
                            <View style={styles.msgRowBot}>
                                <View style={styles.botAvatar}>
                                    <Ionicons name="sparkles" size={16} color="white" />
                                </View>
                                <View style={styles.bubbleBot}>
                                    <Markdown style={markdownStylesBot}>{streamingText}</Markdown>
                                </View>
                            </View>
                        )}

                        {/* Loading Indicator (Next to Icon) */}
                        {loading && streamingText === "" && (
                            <View style={styles.msgRowBot}>
                                <View style={styles.botAvatar}>
                                    <Ionicons name="sparkles" size={16} color="white" />
                                </View>
                                <View style={[styles.bubbleBot, { paddingVertical: 14, paddingHorizontal: 12 }]}>
                                    <TypingIndicator />
                                </View>
                            </View>
                        )}
                    </ScrollView>
                </View>

                {/* Suggestions */}
                {suggestedQuestions.length > 0 && !loading && (
                    <View style={styles.suggestionContainer}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{paddingHorizontal: 16}}>
                            {suggestedQuestions.map((q, i) => (
                                <TouchableOpacity
                                    key={i}
                                    onPress={() => handleSend(q)}
                                    style={styles.suggestionChip}
                                >
                                    <Text style={styles.suggestionText}>{q}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                )}

                {/* Input Bar */}
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Hỏi SAMI..."
                        placeholderTextColor="#9CA3AF"
                        value={input}
                        onChangeText={setInput}
                        editable={!loading}
                        multiline
                    />
                    <TouchableOpacity
                        onPress={() => handleSend()}
                        disabled={loading || !input.trim()}
                        style={[
                            styles.sendButton,
                            (!input.trim() || loading) && { backgroundColor: "#E5E7EB" }
                        ]}
                    >
                        <Ionicons name="arrow-up" size={20} color={(!input.trim() || loading) ? "#9CA3AF" : "white"} />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </View>
      </View>
    </KeyboardProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.brand, // Blue background
  },
  sheetContainer: {
    flex: 1,
    backgroundColor: "#F3F4F6", // Gray Sheet
    marginTop: -24, // Overlap Header
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    overflow: 'hidden',
    paddingTop: 10 + 24
  },
  
  // Message Row Logic
  msgRow: {
      flexDirection: 'row',
      marginBottom: 16,
      maxWidth: '85%',
      alignItems: 'flex-end',
  },
  msgRowUser: {
      alignSelf: 'flex-end',
      justifyContent: 'flex-end',
  },
  msgRowBot: {
      alignSelf: 'flex-start',
      flexDirection: 'row',
  },
  botAvatar: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.brand,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 8,
  },
  bubble: {
      padding: 12,
      paddingHorizontal: 16,
      borderRadius: 20,
  },
  bubbleUser: {
      backgroundColor: colors.brand,
      borderBottomRightRadius: 4,
  },
  bubbleBot: {
      backgroundColor: "white",
      borderBottomLeftRadius: 4,
      shadowColor: "#000",
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
  },
  
  // Typing Indicator
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#9CA3AF',
  },

  // Suggestions
  suggestionContainer: {
      paddingVertical: 10,
      backgroundColor: '#F3F4F6'
  },
  suggestionChip: {
      backgroundColor: "white",
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 20,
      marginRight: 8,
      borderWidth: 1,
      borderColor: "#E5E7EB",
  },
  suggestionText: {
      color: colors.brand,
      fontSize: 13,
      fontWeight: '500'
  },

  // Input
  inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      padding: 12,
      paddingBottom: 16, 
      backgroundColor: "white",
      borderTopWidth: 1,
      borderTopColor: "#E5E7EB",
  },
  input: {
      flex: 1,
      backgroundColor: "#F9FAFB",
      borderRadius: 24,
      paddingHorizontal: 16,
      paddingVertical: 10,
      fontSize: 15,
      color: "#111827",
      maxHeight: 100,
  },
  sendButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.brand,
      alignItems: "center",
      justifyContent: "center",
      marginLeft: 8,
  },
});

const markdownStylesUser = {
  body: { color: "white", fontSize: 15 },
  paragraph: { marginVertical: 0 },
  link: { color: "#BFDBFE" },
};

const markdownStylesBot = {
  body: { color: "#1F2937", fontSize: 15 },
  paragraph: { marginVertical: 0 },
  link: { color: colors.brand },
  strong: { fontWeight: 'bold', color: 'black' }
};
