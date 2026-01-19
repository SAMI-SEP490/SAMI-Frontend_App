import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  Alert,
  ActivityIndicator
} from "react-native";
import Constants from "expo-constants";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
import { forgotPassword } from "../../service/api/auth";

const API_URL = Constants.expoConfig.extra.apiUrl.replace(/\/+$/, "");

export default function ResetPasswordScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleNext = async () => {
    if (!email.trim()) {
      return Alert.alert("Lỗi", "Vui lòng nhập email khôi phục");
    }

    // Email Regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return Alert.alert("Lỗi", "Vui lòng nhập đúng định dạng email hợp lệ");
    }

    setLoading(true);
    try {
      // Call API to send OTP to email
      const res = await forgotPassword(email.trim());

      Alert.alert("Đã gửi mã", `Mã OTP đã được gửi đến ${email}.`);
      
      // Navigate to Verify Code Screen
      navigation.navigate("VerifyCodeScreen", { 
        email: email.trim(),
        userId: res.userId
      });

    } catch (error) {
      const msg = error?.message || "Không thể gửi yêu cầu.";
      Alert.alert("Lỗi", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.inner}>
          
          <View style={styles.card}>
            <Text style={styles.title}>Quên mật khẩu?</Text>
            <Text style={styles.subtitle}>
              Nhập email của bạn để nhận mã xác thực khôi phục mật khẩu.
            </Text>

            <Text style={styles.label}>Email khôi phục</Text>
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              placeholderTextColor="#9CA3AF"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TouchableOpacity 
                style={[styles.button, loading && {opacity: 0.7}]} 
                onPress={handleNext}
                disabled={loading}
            >
              {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Tiếp theo</Text>}
            </TouchableOpacity>

            <TouchableOpacity 
                style={styles.backBtn}
                onPress={() => navigation.goBack()}
            >
                <Text style={styles.backText}>Quay lại Đăng nhập</Text>
            </TouchableOpacity>
          </View>

        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.brand, // Blue
  },
  inner: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
  },
  card: {
    width: "100%",
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    color: "#6B7280",
    fontSize: 14,
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 20
  },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
    color: "#111827",
    marginBottom: 20,
  },
  button: {
    backgroundColor: colors.brand,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  backBtn: { marginTop: 16, alignItems: 'center' },
  backText: { color: colors.brand, fontWeight: '600', fontSize: 14 }
});
