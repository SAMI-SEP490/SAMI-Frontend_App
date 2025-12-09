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
  TextInput,
  TouchableOpacity,
  ActivityIndicator
} from "react-native";
import axios from "axios";
import Constants from "expo-constants";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
import { useAuthStore } from "../../auth"; 

const API_URL = Constants.expoConfig.extra.apiUrl.replace(/\/+$/, "");
const unwrap = (res) => res?.data?.data ?? res?.data;
const roleIsTenant = (u) =>
  String(u?.role || u?.user_type || u?.type || "").toLowerCase() === "tenant";

export default function LoginOTPScreen({ route, navigation }) {
  const { userId, email } = route.params || {};
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const onVerify = async () => {
    try {
      if (!userId || !otp)
        return Alert.alert("Thiếu thông tin", "Vui lòng nhập mã OTP.");
      setLoading(true);

      const res = await axios.post(
        `${API_URL}/auth/verify-otp`,
        { userId, otp },
        { timeout: 15000 }
      );
      const data = unwrap(res);

      if (data?.accessToken && data?.user) {
        if (!roleIsTenant(data.user)) {
          return Alert.alert("Không được phép", "Ứng dụng này chỉ dành cho Tenant.");
        }
        await useAuthStore.getState().setAuth({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          user: data.user,
        });
        return;
      }

      throw new Error("Mã OTP không hợp lệ");
    } catch (e) {
      const msg = e?.response?.data?.message || e.message || "Xác thực thất bại";
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
            <Text style={styles.title}>Xác thực OTP</Text>
            <Text style={styles.subtitle}>
              Mã OTP đã được gửi đến email{"\n"}
              <Text style={{fontWeight: '700', color: colors.text}}>{email || ""}</Text>
            </Text>

            <Text style={styles.label}>Mã xác thực</Text>
            <TextInput
                style={styles.input}
                placeholder="Nhập 6 số"
                placeholderTextColor="#9CA3AF"
                keyboardType="number-pad"
                value={otp}
                onChangeText={setOtp}
                maxLength={6}
                autoFocus
            />

            <TouchableOpacity 
                style={[styles.button, loading && {opacity: 0.7}]} 
                onPress={onVerify}
                disabled={loading}
            >
                {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Xác nhận</Text>}
            </TouchableOpacity>

            <TouchableOpacity 
                style={styles.backBtn}
                onPress={() => navigation.goBack()}
            >
                <Text style={styles.backText}>Quay lại</Text>
            </TouchableOpacity>
          </View>

        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.brand },
  inner: { flex: 1, padding: spacing.lg, justifyContent: "center", alignItems: 'center' },
  card: {
      width: '100%',
      backgroundColor: 'white',
      borderRadius: 16,
      padding: 24,
      shadowColor: "#000",
      shadowOpacity: 0.1,
      shadowRadius: 10,
      elevation: 5
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    textAlign: "center",
    color: "#6B7280",
    marginBottom: 24,
    fontSize: 14,
    lineHeight: 20
  },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 6 },
  input: {
      borderWidth: 1,
      borderColor: '#E5E7EB',
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 12,
      fontSize: 16,
      color: '#111827',
      textAlign: 'center',
      marginBottom: 20,
      letterSpacing: 4
  },
  button: {
      backgroundColor: colors.brand,
      paddingVertical: 14,
      borderRadius: 10,
      alignItems: 'center',
  },
  buttonText: { color: 'white', fontWeight: '700', fontSize: 16 },
  backBtn: { marginTop: 16, alignItems: 'center' },
  backText: { color: '#6B7280', fontSize: 14 }
});
