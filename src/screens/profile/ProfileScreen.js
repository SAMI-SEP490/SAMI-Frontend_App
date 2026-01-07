import React, { useState, useCallback } from "react";
import {
  View,
  ScrollView,
  Text,
  Image,
  Alert,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";

// APIs
import { getProfile } from "../../service/api/auth";
import { getRoomsByUserId } from "../../service/api/room";

// Components
import Header from "../../components/Header";
import Button from "../../components/Button";

// Theme
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";

/* =====================
 * Utils
 * ===================== */
const formatDate = (dateString) => {
  if (!dateString) return "Chưa cập nhật";
  return new Date(dateString).toLocaleDateString("vi-VN");
};

const ROOM_STATUS_VI = {
  available: "Trống",
  occupied: "Đang ở",
  maintenance: "Bảo trì",
};

const mapRoomStatus = (status) => {
  if (!status) return "---";
  return ROOM_STATUS_VI[status] || status;
};

function roleIsTenant(user) {
  const r = String(user?.role || "").toLowerCase();
  return r === "tenant";
}

/* =====================
 * Screen
 * ===================== */
export default function ProfileScreen() {
  const navigation = useNavigation();

  const [user, setUser] = useState(null);
  const [tenantInfo, setTenantInfo] = useState(null);
  const [roomInfo, setRoomInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      setLoading(true);

      /* 1. Get user profile */
      const res = await getProfile();
      const u = res?.user || res?.data?.user || res;

      if (!roleIsTenant(u)) {
        Alert.alert("Không được phép", "Ứng dụng này chỉ dành cho Tenant.", [
          { text: "OK", onPress: () => navigation.navigate("DashboardScreen") },
        ]);
        return;
      }

      setUser(u);

      /* 2. Get tenant + room info */
      if (u?.user_id) {
        const response = await getRoomsByUserId(u.user_id);

        console.log("Fetched Rooms:", response);

        const data = response?.data;
        if (!data) return;

        setTenantInfo(data.tenant_info || null);
        setRoomInfo(data.current_room || null);
      }
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

  /* Reload when screen focus */
  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [])
  );

  /* =====================
   * Loading
   * ===================== */
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

  /* =====================
   * Render
   * ===================== */
  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      <Header title="Hồ sơ cá nhân" isHome={false} />

      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          {/* Avatar */}
          <View style={styles.avatarContainer}>
            <Image
              source={{
                uri: user?.avatar_url || "https://placehold.co/120x120",
              }}
              style={styles.avatar}
            />
            <Text style={styles.userName}>{user?.full_name || user?.name}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>Tenant</Text>
            </View>
          </View>

          {/* Basic Info */}
          <Section title="Thông tin cơ bản">
            <InfoRow
              label="Ngày bắt đầu thuê"
              value={formatDate(tenantInfo?.tenant_since)}
            />
            <InfoRow label="CCCD / CMND" value={tenantInfo?.id_number} />
          </Section>

          {/* Contact Info */}
          <Section title="Thông tin liên hệ">
            <InfoRow label="Email" value={user?.email} />
            <InfoRow label="Số điện thoại" value={user?.phone} />
          </Section>

          {/* Residence Info */}
          <Section title="Thông tin cư trú">
            <InfoRow label="Tòa nhà" value={roomInfo?.building_name} />
            <InfoRow label="Địa chỉ" value={roomInfo?.building_address} />
            <InfoRow
              label="Phòng"
              value={roomInfo?.room_number ? `P.${roomInfo.room_number}` : null}
            />
            <InfoRow
              label="Tầng"
              value={
                roomInfo?.floor !== undefined ? `Tầng ${roomInfo.floor}` : null
              }
            />
            <InfoRow
              label="Diện tích"
              value={roomInfo?.size ? `${roomInfo.size} m²` : null}
            />
            <InfoRow
              label="Trạng thái"
              value={mapRoomStatus(roomInfo?.status)}
            />
          </Section>

          {/* Actions */}
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

/* =====================
 * Components
 * ===================== */
function Section({ title, children }) {
  return (
    <>
      <View style={[styles.sectionHeader, { marginTop: 16 }]}>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <View style={styles.infoContainer}>{children}</View>
    </>
  );
}

function InfoRow({ label, value }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value || "---"}</Text>
    </View>
  );
}

/* =====================
 * Styles
 * ===================== */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.brand,
  },
  contentContainer: {
    flexGrow: 1,
    backgroundColor: "#F3F4F6",
    marginTop: -24,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xl + 24,
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
    flex: 1,
  },
  value: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    flex: 1.5,
    textAlign: "right",
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
