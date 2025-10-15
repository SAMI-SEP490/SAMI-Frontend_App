import React, { useState,useContext } from "react";
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
} from "react-native";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
import { UserContext } from "../../contexts/UserContext";

export default function ResetPasswordScreen({ navigation }) {
const {userData} = useContext(UserContext);
  
  const [identifier, setIdentifier] = useState("");

const handleNext = () => {
  if (!identifier.trim()) {
    Alert.alert("Lỗi", "Vui lòng nhập email khôi phục");
    return;
  }

  // Regex kiểm tra định dạng email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(identifier.trim())) {
    Alert.alert("Lỗi", "Vui lòng nhập đúng định dạng email hợp lệ");
    return;
  }

  // Kiểm tra email có tồn tại trong userData không
  const foundUser = userData.find(
    (user) => user.email.toLowerCase() === identifier.trim().toLowerCase()
  );

  if (!foundUser) {
    Alert.alert("Không tìm thấy", "Email này không tồn tại trong hệ thống");
    return;
  }

  // Nếu hợp lệ, chuyển sang màn hình VerifyCodeScreen
  navigation.navigate("VerifyCodeScreen");
};

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.inner}>
          <Text style={styles.title}>Tìm email của bạn</Text>
          <Text style={styles.subtitle}>
            Nhập email khôi phục
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#999"
            value={identifier}
            onChangeText={setIdentifier}
            keyboardType="email-address"
          />

          <TouchableOpacity style={styles.button} onPress={handleNext}>
            <Text style={styles.buttonText}>Tiếp theo</Text>
          </TouchableOpacity>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.brand, // nền xanh
    justifyContent: "center",
    alignItems: "center",
  },
  inner: {
    backgroundColor: "#fff", // hộp trắng
    width: "85%",
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#000",
    marginBottom: spacing.sm,
    textAlign: "left",
  },
  subtitle: {
    color: "#555",
    fontSize: 14,
    marginBottom: spacing.lg,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    height: 45,
    fontSize: 16,
    paddingHorizontal: spacing.md,
    color: "#000",
    marginBottom: spacing.lg,
  },
  button: {
    backgroundColor: colors.brand,
    borderRadius: 6,
    paddingVertical: 12,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});
