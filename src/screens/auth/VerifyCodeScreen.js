import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
  ActivityIndicator
} from "react-native";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
import { verifyForgotOtp, resendForgotOtp } from "../../service/api/auth";

export default function VerifyCodeScreen({ navigation, route }) {
  const { email } = route.params || {};
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (!code || code.length !== 6) {
      return Alert.alert("Lỗi", "Vui lòng nhập mã xác thực gồm 6 chữ số.");
    }

    setLoading(true);
    try {
      // Call API to verify OTP
      await verifyForgotOtp({ email, otp: code });
      
      // If success, navigate to NewPasswordScreen
      // Pass the email and code forward because the reset endpoint will likely need them
      navigation.navigate("NewPasswordScreen", { email, otp: code });

    } catch (error) {
      const msg = error?.response?.data?.message || "Mã xác thực không đúng.";
      Alert.alert("Lỗi", msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await resendForgotOtp({ email });
      Alert.alert("Thành công", "Mã xác thực mới đã được gửi.");
    } catch (error) {
      Alert.alert("Lỗi", "Không thể gửi lại mã.");
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
            <Text style={styles.title}>Xác minh mã</Text>
            <Text style={styles.subtitle}>
              Nhập mã xác thực được gửi tới{"\n"}
              <Text style={{fontWeight: '700', color: colors.text}}>{email}</Text>
            </Text>

            <Text style={styles.label}>Mã xác thực</Text>
            <TextInput
              style={styles.input}
              placeholder="000000"
              placeholderTextColor="#999"
              value={code}
              onChangeText={setCode}
              keyboardType="number-pad"
              maxLength={6}
              autoFocus
            />

            <TouchableOpacity 
                style={[styles.button, loading && {opacity: 0.7}]} 
                onPress={handleVerify}
                disabled={loading}
            >
              {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Xác nhận</Text>}
            </TouchableOpacity>

            <TouchableOpacity onPress={handleResend} style={{marginTop: 20}}>
              <Text style={styles.resendText}>Chưa nhận được mã? <Text style={{color: colors.brand}}>Gửi lại</Text></Text>
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
    backgroundColor: colors.brand,
  },
  inner: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
  },
  card: {
    backgroundColor: "#fff",
    width: "100%",
    paddingVertical: 30,
    paddingHorizontal: 24,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
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
    textAlign: "center",
    lineHeight: 20
  },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingVertical: 12,
    fontSize: 18,
    textAlign: "center",
    letterSpacing: 8,
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
  resendText: {
    textAlign: "center",
    color: "#6B7280",
    fontSize: 14,
  },
});
