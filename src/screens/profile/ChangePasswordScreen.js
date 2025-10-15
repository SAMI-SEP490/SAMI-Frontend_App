import React, { useState, useContext } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  Alert,
  StyleSheet,
  StatusBar,
} from "react-native";
import Header from "../../components/Header";
import Button from "../../components/Button";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
import { UserContext } from "../../contexts/UserContext";
import { useNavigation } from "@react-navigation/native";

export default function ChangePasswordScreen() {
  const { userData, setUserData, userIdChangepassword } =
    useContext(UserContext);
  const navigation = useNavigation();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const currentUser = userData.find((user) => user.id === userIdChangepassword);

  const handleChangePassword = () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ các trường.");
      return;
    }

    if (!currentUser) {
      Alert.alert("Lỗi", "Không tìm thấy người dùng.");
      return;
    }

    if (oldPassword !== currentUser.password) {
      Alert.alert("Sai mật khẩu", "Mật khẩu cũ không chính xác.");
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert("Lỗi", "Mật khẩu mới phải có ít nhất 6 ký tự.");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Lỗi", "Mật khẩu nhập lại không khớp.");
      return;
    }

    // Cập nhật mật khẩu trong danh sách user
    const updatedUsers = userData.map((user) =>
      user.id === userIdChangepassword
        ? { ...user, password: newPassword }
        : user
    );

    setUserData(updatedUsers);

    Alert.alert("Thành công", "Đổi mật khẩu thành công!");
    navigation.goBack();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle="light-content" />
      {/* Header */}
      <View style={{ paddingBottom: spacing.lg, paddingTop: spacing.xxl }}>
        <Header />
      </View>
      <View style={styles.container}>
        <Text style={styles.title}>Đổi mật khẩu</Text>

        <Text style={styles.label}>Mật khẩu cũ</Text>
        <TextInput
          style={styles.input}
          secureTextEntry
          placeholder="Nhập mật khẩu cũ"
          value={oldPassword}
          onChangeText={setOldPassword}
        />

        <Text style={styles.label}>Mật khẩu mới</Text>
        <TextInput
          style={styles.input}
          secureTextEntry
          placeholder="Nhập mật khẩu mới"
          value={newPassword}
          onChangeText={setNewPassword}
        />

        <Text style={styles.label}>Nhập lại mật khẩu mới</Text>
        <TextInput
          style={styles.input}
          secureTextEntry
          placeholder="Nhập lại mật khẩu mới"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        <View style={styles.buttonRow}>
          <Button
            title="Xác nhận"
            variant="filled"
            onPress={handleChangePassword}
            style={{ flex: 1, backgroundColor: colors.brand }}
          />
          <Button
            title="Quay lại"
            variant="outline"
            onPress={() => navigation.goBack()}
            style={{
              flex: 1,
              backgroundColor: "transparent",
              borderWidth: 1,
              borderColor: colors.brand,
            }}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: colors.text,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: 16,
    color: colors.text,
    marginTop: spacing.md,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 6,
  },
  buttonRow: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.xl,
  },
});
