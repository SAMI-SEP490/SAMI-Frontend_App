import React, { useState } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator
} from "react-native";
import { colors } from "../../theme/colors";
import { resetPassword } from "../../service/api/auth";

export default function NewPasswordScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  
  // Retrieve passed data (needed for API verification)
  const { email, otp } = route.params || {};

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Regex: 1 lowercase, 1 uppercase, 1 special char
  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-={}[\]|\\:;"'<>,.?/~`]).+$/;
    return passwordRegex.test(password);
  };

  const handleConfirm = async () => {
    if (!password || !confirmPassword) {
      return Alert.alert("Thông báo", "Vui lòng nhập đầy đủ thông tin.");
    }

    if (password.length < 6) {
        return Alert.alert("Mật khẩu yếu", "Mật khẩu phải có ít nhất 6 ký tự.");
    }

    if (!validatePassword(password)) {
      return Alert.alert(
        "Mật khẩu yếu",
        "Mật khẩu phải có ít nhất 1 chữ thường, 1 chữ hoa và 1 ký tự đặc biệt."
      );
    }

    if (password !== confirmPassword) {
      return Alert.alert("Lỗi", "Mật khẩu xác nhận không khớp.");
    }

    setLoading(true);
    try {
      // Call API
      await resetPassword({
        email,
        otp,
        new_password: password,
        confirm_password: confirmPassword
      });

      Alert.alert("Thành công", "Mật khẩu đã được thay đổi! Vui lòng đăng nhập lại.", [
          { text: "Về trang đăng nhập", onPress: () => navigation.popToTop() } // Go back to Login
      ]);

    } catch (err) {
      const msg = err?.response?.data?.message || "Không thể đặt lại mật khẩu.";
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
                <Text style={styles.title}>Tạo mật khẩu mới</Text>
                <Text style={styles.subtitle}>
                Đặt lại mật khẩu cho tài khoản{"\n"}
                <Text style={{fontWeight: '700'}}>{email}</Text>
                </Text>

                <Text style={styles.label}>Mật khẩu mới</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Ít nhất 6 ký tự (Hoa, thường, ký tự đặc biệt)"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                />

                <Text style={styles.label}>Xác nhận mật khẩu</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Nhập lại mật khẩu mới"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                />

                <TouchableOpacity 
                    style={[styles.button, loading && {opacity: 0.7}]} 
                    onPress={handleConfirm}
                    disabled={loading}
                >
                    {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Xác nhận</Text>}
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
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 8,
    color: "#111827",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20
  },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 6 },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 16,
    fontSize: 15,
    color: "#111827",
  },
  button: {
    backgroundColor: colors.brand,
    borderRadius: 10,
    paddingVertical: 14,
    width: "100%",
    alignItems: "center",
    marginTop: 8
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
