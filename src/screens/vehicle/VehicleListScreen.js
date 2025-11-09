// Updated: 2025-11-09
// by: DatNB

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import Header from "../../components/Header";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";

// 🔹 Import API service
import { getVehicleRegistrations } from "../../service/api/vehicle";

const VehicleListScreen = () => {
  const navigation = useNavigation();

  const [vehicleData, setVehicleData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [filterType, setFilterType] = useState(null);
  const [filterStatus, setFilterStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  // 🔹 Gọi API lấy danh sách đăng ký xe của người dùng hiện tại
  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const res = await getVehicleRegistrations(); // gọi API backend
      setVehicleData(res || []);
      setFilteredData(res || []);
    } catch (err) {
      console.error("❌ Lỗi khi tải danh sách đăng ký xe:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  // ✅ Cập nhật lại danh sách khi filter thay đổi
  useEffect(() => {
    let data = vehicleData;
    if (filterType)
      data = data.filter(
        (i) => i.vehicle_type === filterType || i.type === filterType
      );
    if (filterStatus) data = data.filter((i) => i.status === filterStatus);
    setFilteredData(data);
  }, [vehicleData, filterType, filterStatus]);

  // =============== UI Helpers ===============
  const getStatusStyle = (status) => {
    switch (status) {
      case "approved":
        return styles.statusApproved;
      case "pending":
        return styles.statusPending;
      case "rejected":
        return styles.statusRejected;
      default:
        return {};
    }
  };

  // 🆕 Render từng item xe
  const renderVehicleItem = ({ item, index }) => (
    <View style={styles.vehicleItem}>
      <View style={styles.vehicleHeader}>
        <Text style={styles.itemText}>#{index + 1}</Text>

        {/* 🔹 Chỉ hiển thị icon Edit nếu trạng thái là pending */}
        {item.status === "pending" && (
          <TouchableOpacity
            style={styles.editIcon}
            onPress={() =>
              navigation.navigate("EditVehicleScreen", { vehicleId: item.id })
            }
          >
            <Ionicons name="create-outline" size={20} color={colors.brand} />
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.itemText}>
        Loại xe: {item.vehicle_type || item.type}
      </Text>
      <Text style={[styles.itemText, getStatusStyle(item.status)]}>
        Trạng thái: {item.status}
      </Text>
      <Text style={styles.itemText}>
        Ngày đăng ký:{" "}
        {item.created_at
          ? new Date(item.created_at).toLocaleDateString("vi-VN")
          : "N/A"}
      </Text>
      <Text style={styles.itemText}>Ghi chú: {item.note || "Không có"}</Text>
    </View>
  );

  // =============== Modal Filter ===============
  const FilterModal = () => {
    const types = [
      ...new Set(vehicleData.map((i) => i.vehicle_type || i.type)),
    ];
    const statuses = [...new Set(vehicleData.map((i) => i.status))];

    return (
      <Modal
        visible={filterModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Bộ lọc</Text>

            <Text style={styles.modalSection}>Loại xe</Text>
            <View style={styles.filterOptionsRow}>
              {types.map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[
                    styles.filterChip,
                    filterType === t && styles.chipSelected,
                  ]}
                  onPress={() => setFilterType(t)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      filterType === t && styles.chipTextSelected,
                    ]}
                  >
                    {t}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.modalSection}>Trạng thái</Text>
            <View style={styles.filterOptionsRow}>
              {statuses.map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[
                    styles.filterChip,
                    filterStatus === s && styles.chipSelected,
                  ]}
                  onPress={() => setFilterStatus(s)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      filterStatus === s && styles.chipTextSelected,
                    ]}
                  >
                    {s}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.brand }]}
                onPress={() => setFilterModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Áp dụng</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#ccc" }]}
                onPress={() => {
                  setFilterType(null);
                  setFilterStatus(null);
                }}
              >
                <Text style={styles.modalButtonText}>Xóa lọc</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={colors.brand} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Header />
      <FilterModal />
      <View style={styles.content}>
        <Text style={styles.title}>Đăng ký xe của tôi</Text>

        <View style={styles.buttonContainer}>
          {/* 🔹 Nút đăng ký xe mới */}
          <TouchableOpacity
            style={[
              styles.newRequestButton,
              { backgroundColor: colors.brand, flex: 1, marginRight: 8 },
            ]}
            onPress={() => navigation.navigate("CreateVehicleScreen")}
          >
            <Text style={styles.newRequestButtonText}>+ Đăng ký xe mới</Text>
          </TouchableOpacity>

          {/* 🔹 Nút lọc */}
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setFilterModalVisible(true)}
          >
            <Ionicons name="filter" size={16} color="#333" />
            <Text style={styles.filterButtonText}>Lọc</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={filteredData}
          renderItem={renderVehicleItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <Text style={{ textAlign: "center", marginTop: 20 }}>
              Không có đăng ký xe nào.
            </Text>
          }
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 16 },
  buttonContainer: {
    flexDirection: "row",
    marginBottom: 16,
    alignItems: "center",
  },
  newRequestButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  filterButton: {
    flexDirection: "row",
    backgroundColor: "#e0e0e0",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  filterButtonText: {
    color: "#333",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  newRequestButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  listContainer: { paddingBottom: 16 },
  vehicleItem: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  vehicleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  editIcon: { padding: 4 },
  itemText: { fontSize: 14, marginBottom: 4 },
  statusApproved: { color: "green", fontWeight: "bold" },
  statusPending: { color: "orange", fontWeight: "bold" },
  statusRejected: { color: "red", fontWeight: "bold" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#fff",
    width: "85%",
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 12 },
  modalSection: { marginTop: 10, fontSize: 16, fontWeight: "600" },
  filterOptionsRow: { flexDirection: "row", flexWrap: "wrap", marginTop: 8 },
  filterChip: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    margin: 4,
  },
  chipSelected: { backgroundColor: colors.brand, borderColor: colors.brand },
  chipText: { fontSize: 14, color: "#333" },
  chipTextSelected: { color: "#fff", fontWeight: "bold" },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 4,
  },
  modalButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});

export default VehicleListScreen;
