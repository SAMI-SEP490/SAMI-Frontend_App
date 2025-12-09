import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  ScrollView,
  Text,
  Image,
  Alert,
  StyleSheet,
  ActivityIndicator,
  StatusBar
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import Constants from "expo-constants";

import Header from "../../components/Header";
import Button from "../../components/Button";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";

// --- HELPERS ---
const API_URL = Constants.expoConfig.extra.apiUrl.replace(/\/+$/, "");
const unwrap = (res) => res?.data?.data ?? res?.data;

const formatDate = (dateString) => {
  if (!dateString) return "Chưa cập nhật";
  const date = new Date(dateString);
  // Returns dd/mm/yyyy
  return date.toLocaleDateString("vi-VN");
};

// Check role
function roleIsTenant(user) {
  const r = String(
    user?.role || user?.user_type || user?.type || ""
  ).toLowerCase();
  return r === "tenant";
}

// Fetch helper
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
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      setLoading(true);
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
      console.log("Profile Fetch Error:", e);
      Alert.alert(
        "Lỗi",
        e?.response?.data?.message || e.message || "Không tải được hồ sơ"
      );
    } finally {
      setLoading(false);
    }
  };

  // Reload profile every time the screen comes into focus (in case of edits)
  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [])
  );

  // --- RENDERING ---

  if (loading && !user) {
    return (
      <View style={styles.container}>
        <Header title="Hồ sơ cá nhân" isHome={false} />
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color="white" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <Header title="Hồ sơ cá nhân" isHome={false} />

      <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        
        {/* Main Card */}
        <View style={styles.card}>
          
          {/* Avatar Area */}
          <View style={styles.avatarContainer}>
            <Image
              source={{
                uri: user?.avatar_url || "https://placehold.co/120x120",
              }}
              style={styles.avatar}
            />
            <Text style={styles.userName}>{user?.full_name || user?.name}</Text>
            <View style={styles.roleBadge}>
                <Text style={styles.roleText}>{user?.role || "Tenant"}</Text>
            </View>
          </View>

          {/* Section: Basic Info */}
          <View style={styles.sectionHeader}>
             <Text style={styles.sectionTitle}>Thông tin cơ bản</Text>
          </View>
          <View style={styles.infoContainer}>
             <InfoRow label="Ngày sinh" value={formatDate(user?.birthday || user?.dob)} />
             <InfoRow label="Giới tính" value={user?.gender === 'Male' ? 'Nam' : user?.gender === 'Female' ? 'Nữ' : 'Khác'} />
          </View>

          {/* Section: Contact Info */}
          <View style={[styles.sectionHeader, { marginTop: 16 }]}>
             <Text style={styles.sectionTitle}>Thông tin liên hệ</Text>
          </View>
          <View style={styles.infoContainer}>
             <InfoRow label="Email" value={user?.email} />
             <InfoRow label="Số điện thoại" value={user?.phone} />
          </View>

          {/* Buttons */}
          <View style={styles.buttonRow}>
            <Button
              title="Đổi mật khẩu"
              variant="outline"
              onPress={() => navigation.navigate("ChangePasswordScreen")}
              style={styles.outlineBtn}
              textStyle={{ color: colors.brand }}
            />
            <Button
              title="Chỉnh sửa"
              onPress={() => navigation.navigate("EditProfile", { user })}
              style={styles.filledBtn}
            />
          </View>

        </View>
      </ScrollView>
    </View>
  );
}

// --- SUB COMPONENTS ---

function InfoRow({ label, value }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value || "---"}</Text>
    </View>
  );
}

// --- STYLES ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.brand, // Blue Background
  },
  contentContainer: {
    flexGrow: 1,
    backgroundColor: "#F3F4F6", // Gray Sheet
    marginTop: -24, // Overlap Header
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xl + 24, // Clear Header
    paddingBottom: 40,
  },
  centerBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: "#F3F4F6",
    marginBottom: 12,
  },
  userName: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 4,
  },
  roleBadge: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },
  roleText: {
    fontSize: 12,
    color: colors.brand,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  sectionHeader: {
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    paddingBottom: 8,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#9CA3AF",
    textTransform: "uppercase",
  },
  infoContainer: {
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  label: {
    fontSize: 14,
    color: "#6B7280",
  },
  value: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
  },
  outlineBtn: {
    flex: 1,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.brand,
  },
  filledBtn: {
    flex: 1,
    backgroundColor: colors.brand,
  },
});
