// src/screens/auth/LoginOTPScreen.js
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
import * as SecureStore from "expo-secure-store";
import Constants from "expo-constants";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";

const API_URL =
  (Constants?.expoConfig?.extra?.apiUrl || "").replace(/\/+$/, "") ||
  "http://192.168.1.50:3000/api";

const unwrap = (res) => res?.data?.data ?? res?.data;

async function saveTokens(accessToken, refreshToken) {
  if (accessToken)
    await SecureStore.setItemAsync("sami_access_token", String(accessToken));
  if (refreshToken)
    await SecureStore.setItemAsync("sami_refresh_token", String(refreshToken));
}

function roleIsTenant(user) {
  const r = String(
    user?.role || user?.user_type || user?.type || ""
  ).toLowerCase();
  return r === "tenant";
}

function showAxiosError(e) {
  const msg = e?.message || "Network Error";
  console.log("AXIOS_OTP_ERR", { msg, url: e?.config?.url, baseURL: API_URL });
  Alert.alert("Lỗi", msg);
}

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
        await saveTokens(data.accessToken, data.refreshToken);
        Alert.alert("Thành công", "Xác thực thành công!");
        return navigation.reset({ index: 0, routes: [{ name: "TabNavigation" }] });
      }

      throw new Error("Mã OTP không hợp lệ");
    } catch (e) {
      showAxiosError(e);
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

          <Text
            style={styles.forgot}
            onPress={() =>
              Alert.alert(
                "Gợi ý",
                "Nếu chưa thấy email, hãy kiểm tra Spam/Promotions."
              )
            }
          >
            Chưa nhận được mã?
          </Text>
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
  forgot: {
    marginTop: spacing.md,
    textAlign: "center",
    color: colors.brand,
    fontWeight: "500",
  },
});
