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
  Modal,
  Alert
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import Header from "../../components/Header";
import { spacing } from "../../theme/spacing";
import { colors } from "../../theme/colors";
import { getGuestRegistrations, cancelGuestRegistration } from "../../service/api/guest";

// Status Mapping
const STATUS_CONFIG = {
  approved: { label: "Đã gửi", color: "#16A34A", bg: "#DCFCE7" },
  cancelled: { label: "Đã hủy", color: "#6B7280", bg: "#F3F4F6" },
  expired: { label: "Hết hạn", color: "#6B7280", bg: "#F3F4F6" },
};

export default function GuestRegistrationListScreen() {
  const navigation = useNavigation();

  // Data State
  const [guestRegistrations, setGuestRegistrations] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  // Filter State
  const [filterStatus, setFilterStatus] = useState(null);
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchGuestRegistrations = async () => {
    try {
      if (!refreshing) setLoading(true);
      const res = await getGuestRegistrations({ page: 1, limit: 50 });
      const registrations = res?.data?.registrations || [];

      setGuestRegistrations(registrations);
      setFilteredData(registrations);
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

  // Filter Logic
  useEffect(() => {
    let data = guestRegistrations;
    if (filterStatus) {
      data = data.filter((item) => item.status === filterStatus);
    }
    setFilteredData(data);
  }, [guestRegistrations, filterStatus]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchGuestRegistrations();
  };

  // --- NEW: Cancel Handler ---
  const handleCancel = (item) => {
    Alert.alert(
      "Hủy báo cáo",
      "Bạn có chắc chắn muốn hủy báo cáo này không?",
      [
        { text: "Không", style: "cancel" },
        {
          text: "Hủy đơn",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              // Backend expects { cancellation_reason }
              await cancelGuestRegistration(item.registration_id, {
                cancellation_reason: "Báo cáo hủy qua app."
              });

              // Refresh list after success
              fetchGuestRegistrations();

            } catch (error) {
              setLoading(false);
              const msg = error?.message || "Không thể hủy báo cáo.";
              Alert.alert("Lỗi", msg);
            }
          }
        }
      ]
    );
  };

  // --- FILTER MODAL ---
  const FilterModal = () => {
    return (
      <Modal
        visible={filterModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Lọc theo trạng thái</Text>

            <View style={styles.wrapRow}>
              {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                <TouchableOpacity
                  key={key}
                  style={[styles.chip, filterStatus === key && styles.chipActive]}
                  onPress={() => setFilterStatus(key === filterStatus ? null : key)}
                >
                  <Text style={[styles.chipText, filterStatus === key && styles.chipTextActive]}>
                    {config.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: '#F3F4F6' }]}
                onPress={() => {
                  setFilterStatus(null);
                  setFilterModalVisible(false);
                }}
              >
                <Text style={{ color: '#374151', fontWeight: '600' }}>Xóa lọc</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: colors.brand }]}
                onPress={() => setFilterModalVisible(false)}
              >
                <Text style={{ color: 'white', fontWeight: '600' }}>Áp dụng</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  const renderItem = ({ item, index }) => {
    const status = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;

    // Format Date: YYYY-MM-DD -> DD/MM/YYYY
    const formatDate = (dateStr) => {
      if (!dateStr) return "N/A";
      return new Date(dateStr).toLocaleDateString('vi-VN');
    }

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.9}
        onPress={() => {
          navigation.navigate("UpdateGuestRegistrationScreen", {
            registrationId: item.registration_id,
          })

        }}
      >
        {/* Header: Title + Status */}
        <View style={styles.cardHeader}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <View style={styles.iconBox}>
              <Ionicons name="people" size={20} color={colors.brand} />
            </View>
            <Text style={styles.cardTitle}>Báo cáo #{index + 1}</Text>
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
            <Text numberOfLines={1} style={{ color: colors.muted, fontSize: 13 }}>
              Khách: {item.guest_details.map(g => g.full_name).join(", ")}
            </Text>
          </View>
        )}

        {/* Action Row for Pending Items */}
        <View style={styles.actionRow}>

          {/* Cancel Button */}
          {item.status !== 'cancelled' && (
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => handleCancel(item)}
            >
              <Ionicons name="close-circle-outline" size={18} color="#EF4444" />
              <Text style={styles.cancelText}>Hủy báo cáo</Text>
            </TouchableOpacity>
          )}

          {/* Edit Text (Right Aligned) */}
          <View style={{ flex: 1, alignItems: 'flex-end' }}>
            <Text style={styles.editText}>Chạm để xem</Text>
          </View>

        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <Header title="Báo cáo khách tạm trú" isHome={false} />
      <FilterModal />

      <View style={styles.contentContainer}>
        {/* Top Action Bar */}
        <View style={styles.topRow}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate("CreateGuestRegistrationScreen")}
          >
            <Ionicons name="add-circle" size={20} color="white" />
            <Text style={styles.addButtonText}>Tạo báo cáo mới</Text>
          </TouchableOpacity>

          {/* Filter Button */}
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setFilterModalVisible(true)}
          >
            <Ionicons name="filter" size={20} color={colors.brand} />
          </TouchableOpacity>
        </View>

        {loading && !refreshing ? (
          <ActivityIndicator size="large" color={colors.brand} style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={filteredData} // Use Filtered Data
            renderItem={renderItem}
            keyExtractor={(item) => item.registration_id.toString()}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.brand]} />
            }
            contentContainerStyle={{ paddingBottom: 40 }}
            ListEmptyComponent={
              <View style={{ alignItems: "center", marginTop: 40 }}>
                <Text style={{ color: colors.muted }}>
                  {guestRegistrations.length === 0 ? "Chưa có đăng ký khách nào." : "Không tìm thấy kết quả phù hợp."}
                </Text>
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
    paddingTop: spacing.xl + 24,
  },
  topRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: spacing.md,
  },
  addButton: {
    flex: 1,
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
  filterButton: {
    backgroundColor: "white",
    width: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
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

  // NEW: Action Row Styles
  actionRow: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingRight: 10
  },
  cancelText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4
  },
  editText: {
    fontSize: 12,
    color: colors.brand,
    fontWeight: "600",
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "85%",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: "700", marginBottom: 16, textAlign: 'center' },
  wrapRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "white",
  },
  chipActive: {
    borderColor: colors.brand,
    backgroundColor: "#EFF6FF",
  },
  chipText: { fontSize: 13, color: "#374151" },
  chipTextActive: { color: colors.brand, fontWeight: "600" },
  modalActions: { flexDirection: "row", gap: 10, marginTop: 24 },
  modalBtn: { flex: 1, padding: 12, borderRadius: 10, alignItems: "center" },
});
