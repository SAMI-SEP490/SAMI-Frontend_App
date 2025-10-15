import React, { useState, useContext } from "react";
import { useNavigation } from "@react-navigation/native";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { colors } from "../../theme/colors";
import { UserContext } from "../../contexts/UserContext";

export default function NewPasswordScreen() {
  const navigation = useNavigation();
  const { userData, setUserData } = useContext(UserContext);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // ✅ Validate password (ít nhất 1 chữ thường, 1 chữ hoa, 1 ký tự đặc biệt)
  const validatePassword = (password) => {
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-={}[\]|\\:;"'<>,.?/~`]).+$/;
    return passwordRegex.test(password);
  };

  const handleConfirm = () => {
    if (!password || !confirmPassword) {
      Alert.alert("Thông báo", "Vui lòng nhập đầy đủ thông tin.");
      return;
    }

    if (!validatePassword(password)) {
      Alert.alert(
        "Mật khẩu yếu",
        "Mật khẩu phải có ít nhất 1 chữ thường, 1 chữ hoa và 1 ký tự đặc biệt."
      );
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Lỗi", "Mật khẩu xác nhận không khớp.");
      return;
    }

    // ✅ Cập nhật data user (cập nhật field password)
    const updatedUser = { ...userData, password };
    setUserData(updatedUser);

    Alert.alert("Thành công", "Mật khẩu đã được thay đổi!");
    navigation.navigate("Login");
  };

  return (
    <View style={styles.container}>
      <View style={styles.whiteBox}>
        <Text style={styles.title}>Tạo mật khẩu mới</Text>
        <Text style={styles.subtitle}>
          Hãy nhập mật khẩu mới để hoàn tất việc đặt lại tài khoản.
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Nhập mật khẩu mới"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TextInput
          style={styles.input}
          placeholder="Xác nhận mật khẩu"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        <TouchableOpacity style={styles.button} onPress={handleConfirm}>
          <Text style={styles.buttonText}>Xác nhận</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.brand,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  whiteBox: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 25,
    width: "100%",
    maxWidth: 380,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 10,
    color: "#000",
  },
  subtitle: {
    fontSize: 14,
    color: "#555",
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    height: 48,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 15,
    backgroundColor: "#fff",
  },
  button: {
    backgroundColor: colors.brand,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    width: "100%",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
