import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Alert,
  StyleSheet,
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ActivityIndicator
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import Header from "../../components/Header";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
import { changePassword } from "../../service/api/auth"; // Import API

export default function ChangePasswordScreen() {
  const navigation = useNavigation();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Visibility toggles
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChangePassword = async () => {
    // 1. Validate
    if (!oldPassword || !newPassword || !confirmPassword) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ các trường.");
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert("Lỗi", "Mật khẩu mới phải có ít nhất 8 ký tự.");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Lỗi", "Mật khẩu nhập lại không khớp.");
      return;
    }

    // 2. Call API
    setLoading(true);
    try {
      await changePassword({
        currentPassword: oldPassword, 
        newPassword: newPassword
      });

      Alert.alert("Thành công", "Đổi mật khẩu thành công!", [
        { text: "OK", onPress: () => navigation.goBack() }
      ]);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Đổi mật khẩu thất bại.";
      Alert.alert("Lỗi", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <Header title="Đổi mật khẩu" isHome={false} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.contentContainer}
      >
        <ScrollView 
            contentContainerStyle={{ paddingBottom: 40 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            
            {/* Old Password */}
            <Text style={styles.label}>Mật khẩu cũ <Text style={{color:'red'}}>*</Text></Text>
            <View style={styles.inputWrapper}>
                <TextInput
                    style={styles.input}
                    secureTextEntry={!showOld}
                    placeholder="Nhập mật khẩu hiện tại"
                    placeholderTextColor="#9CA3AF"
                    value={oldPassword}
                    onChangeText={setOldPassword}
                />
                <TouchableOpacity onPress={() => setShowOld(!showOld)} style={styles.eyeIcon}>
                    <Ionicons name={showOld ? "eye-off-outline" : "eye-outline"} size={20} color="#6B7280" />
                </TouchableOpacity>
            </View>

            {/* New Password */}
            <Text style={styles.label}>Mật khẩu mới <Text style={{color:'red'}}>*</Text></Text>
            <View style={styles.inputWrapper}>
                <TextInput
                    style={styles.input}
                    secureTextEntry={!showNew}
                    placeholder="Nhập mật khẩu mới (min 6 ký tự)"
                    placeholderTextColor="#9CA3AF"
                    value={newPassword}
                    onChangeText={setNewPassword}
                />
                <TouchableOpacity onPress={() => setShowNew(!showNew)} style={styles.eyeIcon}>
                    <Ionicons name={showNew ? "eye-off-outline" : "eye-outline"} size={20} color="#6B7280" />
                </TouchableOpacity>
            </View>

            {/* Confirm Password */}
            <Text style={styles.label}>Nhập lại mật khẩu mới <Text style={{color:'red'}}>*</Text></Text>
            <View style={styles.inputWrapper}>
                <TextInput
                    style={styles.input}
                    secureTextEntry={!showConfirm}
                    placeholder="Xác nhận mật khẩu mới"
                    placeholderTextColor="#9CA3AF"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                />
                <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)} style={styles.eyeIcon}>
                    <Ionicons name={showConfirm ? "eye-off-outline" : "eye-outline"} size={20} color="#6B7280" />
                </TouchableOpacity>
            </View>

          </View>

          {/* Buttons */}
          <View style={{ gap: 12 }}>
            <TouchableOpacity 
                style={[styles.submitButton, loading && {opacity: 0.7}]} 
                onPress={handleChangePassword}
                disabled={loading}
            >
                {loading ? <ActivityIndicator color="white" /> : <Text style={styles.submitText}>Cập nhật mật khẩu</Text>}
            </TouchableOpacity>

            <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={() => navigation.goBack()}
                disabled={loading}
            >
                <Text style={styles.cancelText}>Hủy bỏ</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.brand, // Blue
  },
  contentContainer: {
    flex: 1,
    backgroundColor: "#F3F4F6", // Gray
    marginTop: -24, // Overlap
    paddingHorizontal: spacing.md,
    
    // Push content down to avoid header
    paddingTop: spacing.xl + 24, 
    
    // Square tops as requested
    borderTopLeftRadius: 0, 
    borderTopRightRadius: 0,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    marginBottom: 24
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
    marginTop: 12
  },
  // Wrapper for Input + Eye Icon
  inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: "#E5E7EB",
      borderRadius: 10,
      backgroundColor: "white",
  },
  input: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: "#111827",
  },
  eyeIcon: {
      padding: 12
  },
  // Buttons
  submitButton: {
    backgroundColor: colors.brand,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: 'center',
    elevation: 2
  },
  submitText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700"
  },
  cancelButton: {
    backgroundColor: "white",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.brand
  },
  cancelText: {
    color: colors.brand,
    fontSize: 16,
    fontWeight: "700"
  }
});
