import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";

import Header from "../../components/Header";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
import { getVehicleRegistrations } from "../../service/api/vehicle";

const VEHICLE_TYPE_VN = {
  two_wheeler: "Xe 2 bánh",
  four_wheeler: "Xe 4 bánh",
};

const STATUS_VN = {
  requested: "Đang chờ",
  approved: "Đã duyệt",
  rejected: "Từ chối",
  cancelled: "Đã hủy",
};

const VehicleListScreen = () => {
  const navigation = useNavigation();

  const [vehicleData, setVehicleData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [filterType, setFilterType] = useState(null);
  const [filterStatus, setFilterStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const res = await getVehicleRegistrations();
      const registrations = res?.data?.registrations ?? [];

      setVehicleData(registrations);
      setFilteredData(registrations);
    } catch (err) {
      console.error(err);
      setVehicleData([]);
      setFilteredData([]);
    } finally {
      setLoading(false);
    }
  };
  useFocusEffect(
    useCallback(() => {
      fetchVehicles();
    }, [])
  );

  useEffect(() => {
    let data = vehicleData;
    if (filterType) {
      data = data.filter((i) => i.vehicle_type === filterType);
    }
    if (filterStatus) {
      data = data.filter((i) => i.status === filterStatus);
    }
    setFilteredData(data);
  }, [vehicleData, filterType, filterStatus]);

  const renderVehicleItem = ({ item }) => { 
    const statusColor =
      item.status === "approved"
        ? "#DCFCE7"
        : item.status === "rejected" || item.status === "cancelled"
          ? "#FEE2E2"
          : "#FEF3C7";

    const statusTextColor =
      item.status === "approved"
        ? "#16A34A"
        : item.status === "rejected" || item.status === "cancelled"
          ? "#EF4444"
          : "#D97706";

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.9}
        onPress={() => {
          if (item.status === 'requested') {
            navigation.navigate("EditVehicleScreen", {
              vehicleId: item.registration_id
            });
          }
        }}
      >
        <View style={styles.cardHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={styles.iconBox}>
              <Ionicons
                name={item.vehicle_type === 'four_wheeler' ? 'car-outline' : 'bicycle-outline'}
                size={20}
                color={colors.brand}
              />
            </View>
            <Text style={styles.plateNumber}>{item.license_plate || "N/A"}</Text>
          </View>

          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={[styles.statusText, { color: statusTextColor }]}>
              {STATUS_VN[item.status] || item.status}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.row}>
          <Text style={styles.label}>Loại xe:</Text>
          <Text style={styles.value}>{VEHICLE_TYPE_VN[item.vehicle_type] || "Không xác định"}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Thông tin:</Text>
          <Text style={styles.value}>
            {item.brand ? item.brand : '---'} - {item.color ? item.color : '---'}
          </Text>
        </View>

        {item.status === 'requested' && (
          <View style={{ marginTop: 8, alignSelf: 'flex-end' }}>
            <Text style={{ fontSize: 12, color: colors.brand, fontWeight: '600' }}>Chạm để chỉnh sửa</Text>
          </View>
        )}
          {item.status === 'approved' && (
  <View style={styles.row}>
    <Text style={styles.label}>Vị trí đỗ:</Text>
    <Text style={styles.value}>
      {item.vehicle?.slot
        ? `${item.vehicle.slot.slot_number}${
            item.vehicle.slot.building?.name
              ? ` · ${item.vehicle.slot.building.name}`
              : ''
          }`
        : 'Chưa cấp chỗ'}
    </Text>
  </View>
)}
      </TouchableOpacity>
    );
  };

  const FilterModal = () => {
    const types = [...new Set(vehicleData.map((i) => i.vehicle_type).filter(Boolean))];
    const statuses = [...new Set(vehicleData.map((i) => i.status).filter(Boolean))];

    return (
      <Modal
        visible={filterModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Bộ lọc</Text>

            <Text style={styles.sectionTitle}>Loại xe</Text>
            <View style={styles.wrapRow}>
              {types.map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.chip, filterType === t && styles.chipActive]}
                  onPress={() => setFilterType(t === filterType ? null : t)}
                >
                  <Text style={[styles.chipText, filterType === t && styles.chipTextActive]}>
                    {VEHICLE_TYPE_VN[t] || t}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.sectionTitle}>Trạng thái</Text>
            <View style={styles.wrapRow}>
              {statuses.map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[styles.chip, filterStatus === s && styles.chipActive]}
                  onPress={() => setFilterStatus(s === filterStatus ? null : s)}
                >
                  <Text style={[styles.chipText, filterStatus === s && styles.chipTextActive]}>
                    {STATUS_VN[s] || s}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: '#F3F4F6' }]}
                onPress={() => {
                  setFilterType(null);
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

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <Header title="Phương tiện" isHome={false} />
      <FilterModal />

      <View style={styles.contentContainer}>
        {/* Top Actions */}
        <View style={styles.topRow}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate("CreateVehicleScreen")}
          >
            <Ionicons name="add-circle" size={20} color="white" />
            <Text style={styles.addButtonText}>Đăng ký mới</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setFilterModalVisible(true)}
          >
            <Ionicons name="filter" size={20} color={colors.brand} />
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={colors.brand} style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={filteredData}
            renderItem={renderVehicleItem}
            keyExtractor={(item) => item.registration_id.toString()}
            contentContainerStyle={{ paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={{ alignItems: 'center', marginTop: 40 }}>
                <Text style={{ color: colors.muted }}>Chưa có phương tiện nào.</Text>
              </View>
            }
          />
        )}
      </View>
    </View>
  );
};

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
    borderColor: colors.border,
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
    width: 32, height: 32, borderRadius: 8, backgroundColor: "#E0F2FE", alignItems: 'center', justifyContent: 'center'
  },
  plateNumber: { fontSize: 16, fontWeight: "700", color: "#111827" },
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
  sectionTitle: { fontSize: 14, fontWeight: "600", marginTop: 10, marginBottom: 8, color: '#4B5563' },
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

export default VehicleListScreen;
