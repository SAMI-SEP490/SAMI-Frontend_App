// src/screens/contract/ContractScreen.js
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
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";

import Header from "../../components/Header";
import { spacing } from "../../theme/spacing";
import { colors } from "../../theme/colors";

import { getContracts } from "../../service/api/contract";

// ===== STATUS MAPPING (tiếng Việt + màu sắc) =====
const STATUS_CONFIG = {
  // --- Nhóm Active/Cần xử lý (Màu nổi) ---
  active: { label: "Đang hiệu lực", color: "#16A34A", bg: "#DCFCE7" }, // Xanh lá
  pending: { label: "Chờ ký", color: "#D97706", bg: "#FEF3C7" }, // Cam
  pending_transaction: { label: "Chờ thanh toán", color: "#EAB308", bg: "#FEF9C3" }, // Vàng
  requested_termination: { label: "Yêu cầu hủy", color: "#C026D3", bg: "#FAE8FF" }, // Tím

  // --- Nhóm Lịch sử/Inactive (Màu chìm/Cảnh báo) ---
  rejected: { label: "Đã từ chối", color: "#EF4444", bg: "#FEE2E2" }, // Đỏ nhạt
  expired: { label: "Hết hạn", color: "#4B5563", bg: "#E5E7EB" }, // Xám đậm
  terminated: { label: "Đã chấm dứt", color: "#4B5563", bg: "#E5E7EB" }, // Xám đậm
  cancelled: { label: "Đã hủy", color: "#9CA3AF", bg: "#F3F4F6" }, // Xám nhạt
};;

export default function ContractScreen() {
  const navigation = useNavigation();
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchContracts = async () => {
    try {
      if (!refreshing) setLoading(true);
      const res = await getContracts();
      const rawData = res?.data ?? [];

      // Định nghĩa độ ưu tiên (Số càng nhỏ càng ưu tiên hiển thị lên đầu)
      const priority = {
        pending: 1,
        active: 2,
        pending_transaction: 3,
        requested_termination: 4,
        expired: 10,
        terminated: 11,
        rejected: 12,
        cancelled: 13
      };

      // Sắp xếp: Ưu tiên theo Status trước, sau đó đến ngày tạo mới nhất
      const sortedData = rawData.sort((a, b) => {
        const pA = priority[a.status] || 99;
        const pB = priority[b.status] || 99;

        if (pA !== pB) return pA - pB; // Khác nhóm -> Xếp theo nhóm
        return new Date(b.created_at) - new Date(a.created_at); // Cùng nhóm -> Mới nhất lên đầu
      });

      setContracts(sortedData);
    } catch (err) {
      console.log("Lỗi getContracts:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchContracts();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchContracts();
  };

  // Format date
  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString("vi-VN") : "Không rõ";

  // ===== RENDER CARD =====
  const renderItem = ({ item }) => {
    // Lấy config màu, nếu không có thì fallback về cancelled
    const s = STATUS_CONFIG[item.status] || STATUS_CONFIG.cancelled;

    // Kiểm tra xem đây có phải là trạng thái "Inactive" không để làm mờ
    const isInactive = ['rejected', 'terminated', 'expired', 'cancelled'].includes(item.status);

    return (
        <TouchableOpacity
            style={[
              styles.card,
              // Nếu inactive thì làm mờ và đổi nền xám nhẹ
              isInactive && { opacity: 0.6, backgroundColor: '#F9FAFB' }
            ]}
            activeOpacity={0.9}
            onPress={() => navigation.navigate("ContractDetailScreen", { contractId: item.contract_id })}
        >
          {/* HEADER */}
          <View style={styles.cardHeader}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <View style={[
                styles.iconBox,
                // Icon cũng đổi màu xám nếu inactive
                isInactive && { backgroundColor: '#E5E7EB' }
              ]}>
                <Ionicons
                    name="document-text"
                    size={20}
                    color={isInactive ? "#6B7280" : colors.brand}
                />
              </View>
              <Text style={[
                styles.cardTitle,
                isInactive && { color: '#4B5563', textDecorationLine: item.status === 'rejected' ? 'line-through' : 'none' }
              ]}>
                Hợp đồng #{item.contract_number || item.contract_id}
              </Text>
            </View>

            <View style={[styles.statusBadge, { backgroundColor: s.bg }]}>
              <Text style={[styles.statusText, { color: s.color }]}>
                {s.label}
              </Text>
            </View>
          </View>

        <View style={styles.divider} />

        {/* ROWS */}
        <View style={styles.row}>
          <Text style={styles.label}>Phòng:</Text>
          <Text style={styles.value}>{item.room_number}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Người thuê:</Text>
          <Text style={styles.value}>{item.tenant_name}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Email:</Text>
          <Text style={styles.value}>{item.tenant_email}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Ngày bắt đầu:</Text>
          <Text style={styles.value}>{formatDate(item.start_date)}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Ngày kết thúc:</Text>
          <Text style={styles.value}>{formatDate(item.end_date)}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Tiền thuê:</Text>
          <Text style={styles.value}>
            {Number(item.rent_amount).toLocaleString("vi-VN")} đ
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Tiền cọc:</Text>
          <Text style={styles.value}>
            {Number(item.deposit_amount).toLocaleString("vi-VN")} đ
          </Text>
        </View>

        {item.note ? (
          <Text style={styles.noteText}>Ghi chú: {item.note}</Text>
        ) : null}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />
      <Header title="Hợp đồng" isHome={false} />

      <View style={styles.contentContainer}>
        {loading && !refreshing ? (
          <ActivityIndicator
            size="large"
            color={colors.brand}
            style={{ marginTop: 40 }}
          />
        ) : (
          <FlatList
            data={contracts}
            keyExtractor={(item) => item.contract_id.toString()}
            renderItem={renderItem}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[colors.brand]}
              />
            }
            ListEmptyComponent={
              <View style={{ marginTop: 40, alignItems: "center" }}>
                <Text style={{ color: colors.muted }}>
                  Không có hợp đồng nào.
                </Text>
              </View>
            }
            contentContainerStyle={{ paddingBottom: 60 }}
          />
        )}
      </View>
    </View>
  );
}

// ===== STYLES =====
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.brand },
  contentContainer: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    marginTop: -24,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xl + 24,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
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
    justifyContent: "center",
    alignItems: "center",
  },
  cardTitle: { fontSize: 16, fontWeight: "700", color: "#111827" },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: { fontSize: 11, fontWeight: "700" },
  divider: { height: 1, backgroundColor: "#E5E7EB", marginVertical: 8 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  label: { fontSize: 13, color: "#6B7280" },
  value: { fontSize: 13, fontWeight: "500", color: "#111827" },
  noteText: {
    marginTop: 6,
    fontSize: 13,
    color: "#374151",
    fontStyle: "italic",
  },
});
