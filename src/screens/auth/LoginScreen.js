import React, { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import {
  View,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
  Platform,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  ScrollView
} from "react-native";
// FIX: Use the modern keyboard controller
import { KeyboardProvider, KeyboardAvoidingView } from "react-native-keyboard-controller";

import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";

// IMPORT SMART LOGIN FUNCTION
import { login, useAuthStore } from "../../auth";

const roleIsTenant = (u) =>
  String(u?.role || u?.user_type || u?.type || "").toLowerCase() === "tenant";

export default function LoginScreen() {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onLogin = async () => {
    if (!email || !password) {
        return Alert.alert("Thông báo", "Vui lòng nhập đầy đủ email và mật khẩu.");
    }

    try {
      setLoading(true);
      
      // CALL CENTRALIZED LOGIN
      const data = await login({ email, password });

      // 1. Case OTP
      if (data?.requiresOTP) {
        return navigation.navigate("LoginOTP", {
          userId: data.userId,
          email: data.email || email,
        });
      }

      // 2. Case Success
      // Note: login() already updated the store with the token
      // We just need to check role and navigate
      if (data?.user) {
        if (!roleIsTenant(data.user)) {
          // If wrong role, logout immediately to clear store
          await useAuthStore.getState().logout();
          return Alert.alert(
            "Không được phép",
            "Ứng dụng này chỉ dành cho Tenant."
          );
        }
        // RootNavigation will detect token change and switch stacks
        return;
      }

      throw new Error("Phản hồi không hợp lệ");
    } catch (e) {
      const msg = e?.response?.data?.message || e.message || "Đăng nhập thất bại";
      Alert.alert("Lỗi đăng nhập", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardProvider>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "padding"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          {/* ScrollView allows the form to be pushed up cleanly */}
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            
            {/* Logo / Brand Name */}
            <View style={styles.headerArea}>
               <Text style={styles.brandName}>SAMI</Text>
               <Text style={styles.brandSlogan}>Quản lý chung cư thông minh</Text>
            </View>

            {/* Login Card */}
            <View style={styles.card}>
              <Text style={styles.title}>Đăng Nhập</Text>

              <Text style={styles.label}>Email</Text>
              <TextInput
                  style={styles.input}
                  placeholder="you@example.com"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
              />

              <Text style={styles.label}>Mật khẩu</Text>
              <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
              />

              <TouchableOpacity 
                  style={[styles.button, loading && {opacity: 0.7}]} 
                  onPress={onLogin}
                  disabled={loading}
              >
                  {loading ? (
                      <ActivityIndicator color="white" />
                  ) : (
                      <Text style={styles.buttonText}>Đăng nhập</Text>
                  )}
              </TouchableOpacity>

              <TouchableOpacity 
                  style={styles.forgotBtn}
                  onPress={() => navigation.navigate("ResetPasswordScreen")}
              >
                  <Text style={styles.forgotText}>Quên mật khẩu?</Text>
              </TouchableOpacity>
            </View>

          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </KeyboardProvider>
  );
}

const styles = StyleSheet.create({
  container: { 
      flex: 1, 
      backgroundColor: colors.brand 
  },
  scrollContent: {
      flexGrow: 1, 
      justifyContent: "center", // Keeps it centered when keyboard is closed
      alignItems: 'center',
      padding: spacing.lg 
  },
  headerArea: {
      alignItems: 'center',
      marginBottom: 30
  },
  brandName: {
      fontSize: 40,
      fontWeight: '900',
      color: 'white',
      letterSpacing: 2
  },
  brandSlogan: {
      color: '#BFDBFE',
      fontSize: 14,
      marginTop: 4
  },
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
    color: "#111827",
    marginBottom: 20,
    textAlign: "center",
  },
  label: {
      fontSize: 14,
      fontWeight: '600',
      color: '#374151',
      marginBottom: 6
  },
  input: {
      borderWidth: 1,
      borderColor: '#E5E7EB',
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 12,
      fontSize: 15,
      color: '#111827',
      marginBottom: 16
  },
  button: {
      backgroundColor: colors.brand,
      paddingVertical: 14,
      borderRadius: 10,
      alignItems: 'center',
      marginTop: 8
  },
  buttonText: {
      color: 'white',
      fontWeight: '700',
      fontSize: 16
  },
  forgotBtn: {
      marginTop: 16,
      alignItems: 'center'
  },
  forgotText: {
      color: colors.brand,
      fontWeight: '600',
      fontSize: 14
  }
});
