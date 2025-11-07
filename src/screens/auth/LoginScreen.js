// src/screens/auth/LoginScreen.js
import React, { useState } from "react";
import { useNavigation } from "@react-navigation/native";
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
  "http://192.168.1.50:3000/api"; // TODO: đổi IP LAN cho đúng

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

// để debug Network Error
function showAxiosError(e) {
  const code = e?.code || "";
  const msg = e?.message || "";
  const url = e?.config?.url || "";
  console.log("AXIOS_ERR", { code, msg, url, baseURL: API_URL });
  Alert.alert("Lỗi đăng nhập", msg || "Network Error");
}

export default function LoginScreen() {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onLogin = async () => {
    try {
      setLoading(true);

      const res = await axios.post(
        `${API_URL}/auth/login`,
        { email, password },
        { timeout: 15000 }
      );
      const data = unwrap(res);

      if (data?.requiresOTP) {
        // user chưa verify → sang màn OTP
        return navigation.navigate("LoginOTP", {
          userId: data.userId,
          email: data.email || email,
        });
      }

      if (data?.accessToken && data?.user) {
        // chỉ cho TENANT
        if (!roleIsTenant(data.user)) {
          return Alert.alert(
            "Không được phép",
            "Ứng dụng này chỉ dành cho Tenant."
          );
        }
        await saveTokens(data.accessToken, data.refreshToken);
        Alert.alert("Thành công", "Đăng nhập thành công!");
        return navigation.reset({ index: 0, routes: [{ name: "TabNavigation" }] });
      }

      throw new Error("Phản hồi không hợp lệ");
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
          <Text style={styles.title}>Đăng Nhập</Text>

          <TextField
            label="Email"
            placeholder="you@example.com"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />

          <TextField
            label="Mật khẩu"
            placeholder="••••••••"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <Button
            title={loading ? "Đang đăng nhập..." : "Đăng nhập"}
            onPress={onLogin}
            style={{ marginTop: spacing.md }}
          />

          <Text
            style={styles.forgot}
            onPress={() => navigation.navigate("ResetPasswordScreen")}
          >
            Quên mật khẩu?
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
