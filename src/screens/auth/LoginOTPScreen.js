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
import axios from "axios";
import Constants from "expo-constants";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
import { useAuthStore } from "../../auth"; // <-- quan trọng

const API_URL =
  (Constants?.expoConfig?.extra?.apiUrl || "").replace(/\/+$/, "") ||
  "https://lonely-alberta-jackets-academics.trycloudflare.com/api";

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
          return Alert.alert(
            "Không được phép",
            "Ứng dụng này chỉ dành cho Tenant."
          );
        }
        // cập nhật store -> RootNavigation tự chuyển sang app stack
        await useAuthStore.getState().setAuth({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          user: data.user,
        });
        return;
      }

      throw new Error("Mã OTP không hợp lệ");
    } catch (e) {
      const msg =
        e?.response?.data?.message || e.message || "Xác thực thất bại";
      console.log("OTP_ERR:", msg);
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
          <Text style={styles.title}>Xác thực OTP</Text>
          <Text style={styles.subtitle}>
            Mã OTP đã được gửi đến email {email || ""}
          </Text>

          <TextField
            label="Mã OTP"
            placeholder="Nhập 6 số"
            keyboardType="number-pad"
            value={otp}
            onChangeText={setOtp}
          />

          <Button
            title={loading ? "Đang xác thực..." : "Xác nhận"}
            onPress={onVerify}
            style={{ marginTop: spacing.md }}
          />
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  inner: { flex: 1, padding: spacing.xl, justifyContent: "center" },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: "center",
  },
  subtitle: {
    textAlign: "center",
    color: colors.muted,
    marginBottom: spacing.lg,
  },
});
