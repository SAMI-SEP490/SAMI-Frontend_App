import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import Header from "../../components/Header";
import { spacing } from "../../theme/spacing";
import { colors } from "../../theme/colors";
import { getGuestRegistrations } from "../../service/api/guest";

// Status Mapping
const STATUS_CONFIG = {
  approved: { label: "Đã duyệt", color: "#16A34A", bg: "#DCFCE7" },
  rejected: { label: "Từ chối", color: "#EF4444", bg: "#FEE2E2" },
  pending: { label: "Chờ duyệt", color: "#D97706", bg: "#FEF3C7" },
  cancelled: { label: "Đã hủy", color: "#6B7280", bg: "#F3F4F6" },
};

export default function GuestRegistrationListScreen() {
  const navigation = useNavigation();
  const [guestRegistrations, setGuestRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchGuestRegistrations = async () => {
    try {
      if (!refreshing) setLoading(true);
      const res = await getGuestRegistrations({ page: 1, limit: 50 });
      const registrations = res?.data?.registrations || [];
      setGuestRegistrations(registrations);
    } catch (error) {
      console.error("Lỗi lấy danh sách:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchGuestRegistrations();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchGuestRegistrations();
  };

  const renderItem = ({ item, index }) => {
    const status = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;
    
    // Format Date: YYYY-MM-DD -> DD/MM/YYYY
    const formatDate = (dateStr) => {
        if(!dateStr) return "N/A";
        return new Date(dateStr).toLocaleDateString('vi-VN');
    }

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.9}
        onPress={() => {
            if(item.status === 'pending'){
                navigation.navigate("UpdateGuestRegistrationScreen", {
                    registrationId: item.registration_id,
                })
            }
        }}
      >
        {/* Header: Title + Status */}
        <View style={styles.cardHeader}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <View style={styles.iconBox}>
              <Ionicons name="people" size={20} color={colors.brand} />
            </View>
            <Text style={styles.cardTitle}>Đơn #{index + 1}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
            <Text style={[styles.statusText, { color: status.color }]}>
              {status.label}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Details */}
        <View style={styles.row}>
          <Text style={styles.label}>Số lượng:</Text>
          <Text style={styles.value}>{item.guest_count} người</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Thời gian:</Text>
          <Text style={styles.value}>
            {formatDate(item.arrival_date)} - {formatDate(item.departure_date)}
          </Text>
        </View>

        {item.guest_details?.length > 0 && (
            <View style={styles.guestPreview}>
                <Text numberOfLines={1} style={{color: colors.muted, fontSize: 13}}>
                    Khách: {item.guest_details.map(g => g.full_name).join(", ")}
                </Text>
            </View>
        )}

        {item.status === 'pending' && (
            <Text style={styles.editText}>Chạm để chỉnh sửa</Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <Header title="Đăng ký khách" isHome={false} />

      <View style={styles.contentContainer}>
        {/* Top Action Bar */}
        <View style={styles.topRow}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate("CreateGuestRegistrationScreen")}
          >
            <Ionicons name="add-circle" size={20} color="white" />
            <Text style={styles.addButtonText}>Tạo đơn mới</Text>
          </TouchableOpacity>
        </View>

        {loading && !refreshing ? (
          <ActivityIndicator size="large" color={colors.brand} style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={guestRegistrations}
            renderItem={renderItem}
            keyExtractor={(item) => item.registration_id.toString()}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.brand]} />
            }
            contentContainerStyle={{ paddingBottom: 40 }}
            ListEmptyComponent={
              <View style={{ alignItems: "center", marginTop: 40 }}>
                <Text style={{ color: colors.muted }}>Chưa có đăng ký khách nào.</Text>
              </View>
            }
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.brand },
  contentContainer: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    marginTop: -24,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xl + 24, // Clear header
  },
  topRow: {
    marginBottom: spacing.md,
  },
  addButton: {
    backgroundColor: colors.brand,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 12,
    gap: 8,
    elevation: 2,
  },
  addButtonText: { color: "white", fontWeight: "700", fontSize: 15 },
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#E0F2FE",
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: { fontSize: 16, fontWeight: "700", color: "#111827" },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: { fontSize: 11, fontWeight: "700", textTransform: "uppercase" },
  divider: { height: 1, backgroundColor: "#F3F4F6", marginVertical: 8 },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  label: { fontSize: 13, color: "#6B7280" },
  value: { fontSize: 13, color: "#111827", fontWeight: "500" },
  guestPreview: {
      marginTop: 6,
      backgroundColor: '#F9FAFB',
      padding: 8,
      borderRadius: 6
  },
  editText: {
      marginTop: 8,
      fontSize: 12,
      color: colors.brand,
      fontWeight: "600",
      textAlign: 'right'
  }
});
