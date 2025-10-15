import React, { useState, useContext } from "react";
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
} from "react-native";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
import { UserContext } from "../../contexts/UserContext";

export default function VerifyCodeScreen({ navigation }) {
    const {trueCode} = useContext(UserContext);
  const [code, setCode] = useState("");

  const handleVerify = () => {
  // Kiểm tra trống
  if (!code.trim()) {
    Alert.alert("Lỗi", "Vui lòng nhập mã xác thực");
    return;
  }

  // Kiểm tra độ dài
  if (code.length !== 6) {
    Alert.alert("Lỗi", "Mã xác thực phải gồm 6 chữ số");
    return;
  }

  // Kiểm tra phải là số
  if (!/^\d{6}$/.test(code)) {
    Alert.alert("Lỗi", "Mã xác thực chỉ được chứa chữ số");
    return;
  }

  // So sánh với trueCode
  if (code === trueCode) {
    Alert.alert("Thành công", "Mã xác thực chính xác!");
    navigation.navigate("NewPasswordScreen");
  } else {
    Alert.alert("Sai mã", "Mã xác thực không đúng, vui lòng thử lại.");
  }
};

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.inner}>
          <Text style={styles.title}>Xác minh mã</Text>
          <Text style={styles.subtitle}>
            Nhập mã xác thực được gửi tới email của bạn
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Nhập mã 6 ký tự"
            placeholderTextColor="#999"
            value={code}
            onChangeText={setCode}
            keyboardType="number-pad"
            maxLength={6}
          />

          <TouchableOpacity style={styles.button} onPress={handleVerify}>
            <Text style={styles.buttonText}>Xác nhận</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => Alert.alert("Đã gửi lại mã xác thực")}
          >
            <Text style={styles.resendText}>Gửi lại mã?</Text>
          </TouchableOpacity>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.brand,
    justifyContent: "center",
    alignItems: "center",
  },
  inner: {
    backgroundColor: "#fff",
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
    textAlign: "center",
    letterSpacing: 8,
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
  resendText: {
    marginTop: spacing.md,
    textAlign: "center",
    color: colors.brand,
    fontWeight: "600",
    fontSize: 14,
  },
});
