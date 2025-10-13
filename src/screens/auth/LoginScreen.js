// src/screens/auth/LoginScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
  Platform,
} from "react-native";
import TextField from "../../components/TextField";
import Button from "../../components/Button";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-={}[\]|\\:;"'<>,.?/~`]).+$/;
    return passwordRegex.test(password);
  };

  const handleLogin = () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ Email và Mật khẩu");
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert("Lỗi", "Email không đúng định dạng");
      return;
    }

    if (!validatePassword(password)) {
      Alert.alert(
        "Lỗi",
        "Mật khẩu phải có ít nhất 1 chữ hoa, 1 chữ thường và 1 ký tự đặc biệt"
      );
      return;
    }

    // Giả lập login thành công
    navigation.replace("Main");
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.inner}>
          <Text style={styles.title}>Đăng Nhập</Text>

          <TextField
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="Nhập email"
            keyboardType="email-address"
          />

          <TextField
            label="Mật khẩu"
            value={password}
            onChangeText={setPassword}
            placeholder="Nhập mật khẩu"
            secureTextEntry
          />

          <Button title="Đăng Nhập" onPress={handleLogin} style={{ marginTop: spacing.lg }} />

          <Text style={styles.forgot}>Bạn quên mật khẩu?</Text>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.brand, // màu nền chính
    justifyContent: "center",
  },
  inner: {
    backgroundColor: "#fff",
    marginHorizontal: spacing.xl,
    padding: spacing.xl,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.textDark || "#000",
    marginBottom: spacing.lg,
    textAlign: "center",
  },
  forgot: {
    marginTop: spacing.md,
    textAlign: "center",
    color: colors.brand,
    fontWeight: "500",
  },
});
