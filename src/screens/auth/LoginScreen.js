import React, { useState } from "react";
import { useNavigation, CommonActions } from "@react-navigation/native";
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
import { useAuthStore } from "../../auth";

const API_URL = Constants.expoConfig.extra.apiUrl.replace(/\/+$/, "");

const unwrap = (res) => res?.data?.data ?? res?.data;
const roleIsTenant = (u) =>
  String(u?.role || u?.user_type || u?.type || "").toLowerCase() === "tenant";

// --- DEBUG GUARD: log mọi lần reset (để tìm thủ phạm) ---
if (__DEV__ && !CommonActions.__samiPatched) {
  const _reset = CommonActions.reset;
  CommonActions.reset = (...args) => {
    console.warn(
      "⚠️ CommonActions.reset was called with:",
      JSON.stringify(args)
    );
    return _reset(...args);
  };
  CommonActions.__samiPatched = true;
}
// --------------------------------------------------------

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
        return navigation.navigate("LoginOTP", {
          userId: data.userId,
          email: data.email || email,
        });
      }

      if (data?.accessToken && data?.user) {
        if (!roleIsTenant(data.user)) {
          return Alert.alert(
            "Không được phép",
            "Ứng dụng này chỉ dành cho Tenant."
          );
        }
        await useAuthStore.getState().setAuth({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          user: data.user,
        });
        // KHÔNG reset/replace/navigate nữa. RootNavigation sẽ tự chuyển stack.
        return;
      }

      throw new Error("Phản hồi không hợp lệ");
    } catch (e) {
      const msg =
        e?.response?.data?.message || e.message || "Đăng nhập thất bại";
      console.log("LOGIN_ERR:", msg);
      Alert.alert("Lỗi đăng nhập", msg);
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
