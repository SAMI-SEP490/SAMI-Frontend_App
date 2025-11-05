// src/screens/profile/ProfileScreen.js
import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  Image,
  StatusBar,
  Alert,
} from "react-native";
import Header from "../../components/Header";
import Button from "../../components/Button";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import Constants from "expo-constants";
import { useNavigation } from "@react-navigation/native";

const API_URL =
  (Constants?.expoConfig?.extra?.apiUrl || "").replace(/\/+$/, "") ||
  "http://192.168.1.50:3000/api";
const unwrap = (res) => res?.data?.data ?? res?.data;

function roleIsTenant(user) {
  const r = String(
    user?.role || user?.user_type || user?.type || ""
  ).toLowerCase();
  return r === "tenant";
}

async function authGet(path) {
  const token = await SecureStore.getItemAsync("sami_access_token");
  const res = await axios.get(`${API_URL}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    timeout: 15000,
  });
  return unwrap(res);
}

export default function ProfileScreen() {
  const navigation = useNavigation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await authGet("/auth/profile");
        const u = data?.user || data;
        if (!roleIsTenant(u)) {
          Alert.alert("Không được phép", "Ứng dụng này chỉ dành cho Tenant.", [
            { text: "OK", onPress: () => navigation.navigate("Login") },
          ]);
          return;
        }
        setUser(u);
      } catch (e) {
        Alert.alert(
          "Lỗi",
          e?.response?.data?.message || e.message || "Không tải được hồ sơ"
        );
      }
    })();
  }, []);

  if (!user) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <Header title="Hồ sơ" />
        <View style={{ padding: spacing.xl }}>
          <Text style={{ color: colors.muted }}>Đang tải...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle="dark-content" />
      <Header title="Hồ sơ" />

      <ScrollView contentContainerStyle={{ padding: spacing.xl }}>
        <View
          style={{
            backgroundColor: colors.card,
            borderRadius: 12,
            padding: spacing.lg,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <View style={{ alignItems: "center", marginBottom: spacing.lg }}>
            <Image
              source={{
                uri: user?.avatar_url || "https://placehold.co/120x120",
              }}
              style={{ width: 120, height: 120, borderRadius: 60 }}
            />
          </View>

          <Section title="Thông tin cơ bản">
            <InfoRow label="Tên" value={user?.full_name || user?.name} />
            <InfoRow label="Ngày sinh" value={user?.birthday || user?.dob} />
            <InfoRow label="Giới tính" value={user?.gender} />
            <InfoRow
              label="Vai trò"
              value={user?.role || user?.user_type || "Tenant"}
            />
          </Section>

          <View style={{ height: spacing.lg }} />

          <Section title="Thông tin liên hệ">
            <InfoRow label="Email" value={user?.email} />
            <InfoRow label="SĐT" value={user?.phone} />
          </Section>

          <View
            style={{
              flexDirection: "row",
              gap: spacing.md,
              marginTop: spacing.lg,
            }}
          >
            <Button
              title="Thay đổi mật khẩu"
              variant="outline"
              onPress={() => navigation.navigate("ChangePasswordScreen")}
              style={{
                flex: 1,
                backgroundColor: "transparent",
                borderWidth: 1,
                borderColor: colors.brand,
              }}
              textStyle={{ color: colors.brand }}
            />
            <Button
              title="Chỉnh sửa"
              onPress={() => navigation.navigate("EditProfile", { user })}
              style={{ flex: 1, backgroundColor: colors.brand }}
            />
          </View>

          <Button
            title="Quay lại"
            variant="outline"
            onPress={() => navigation.goBack()}
            style={{
              marginTop: spacing.md,
              backgroundColor: "transparent",
              borderWidth: 1,
              borderColor: colors.brand,
            }}
            textStyle={{ color: colors.brand }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, children }) {
  return (
    <View>
      <Text
        style={{
          fontSize: 16,
          fontWeight: "700",
          color: colors.text,
          marginBottom: spacing.sm,
        }}
      >
        {title}
      </Text>
      <View
        style={{
          backgroundColor: colors.card,
          borderRadius: 10,
          padding: spacing.md,
          borderWidth: 1,
          borderColor: colors.border,
        }}
      >
        {children}
      </View>
    </View>
  );
}

function InfoRow({ label, value }) {
  return (
    <View style={{ flexDirection: "row", paddingVertical: 8 }}>
      <Text style={{ flex: 1, color: colors.muted }}>{label}:</Text>
      <Text style={{ flex: 1, color: colors.text, fontWeight: "600" }}>
        {value ?? ""}
      </Text>
    </View>
  );
}
