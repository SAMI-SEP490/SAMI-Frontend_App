// Updated: 2025-11-08
// By: MinhBH

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import * as SecureStore from "expo-secure-store";
import { jwtDecode } from "jwt-decode";

import Header from "../../components/Header";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
import { getRoomMaintenanceHistory, deleteMaintenanceRequest } from "../../service/api/maintenance";
import { getRoomsByUserId } from "../../service/api/room";

const MaintenanceListScreen = () => {
  const navigation = useNavigation();
  const [maintenanceData, setMaintenanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const loadToken = async () => {
      const storedToken = await SecureStore.getItemAsync("sami_access_token");
      if (storedToken) {
        setToken(storedToken);
      } else {
        Alert.alert(
          "Lỗi",
          "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
        );
      }
    };
    loadToken();
  }, []);

  const fetchMaintenanceData = async () => {
    if (!token) return;
    try {
      setLoading(true);

      const decoded = jwtDecode(token);
      const userId = decoded?.id || decoded?.userId;
      if (!userId) throw new Error("Token không hợp lệ");

      const roomRes = await getRoomsByUserId(userId);
      const roomId = roomRes?.data?.current_room?.room_id;
      const roomInfo = roomRes?.data?.current_room || {};
      if (!roomId) throw new Error("Người dùng chưa có phòng nào");

      const historyRes = await getRoomMaintenanceHistory(roomId);
      const historyData = historyRes?.data?.data || [];

      const historyWithRoom = historyData.map((item) => ({
        ...item,
        roomName: roomInfo.room_number,
        buildingName: roomInfo.building_name,
      }));

      setMaintenanceData(historyWithRoom);
    } catch (error) {
      console.error("❌ Lỗi khi tải dữ liệu bảo trì:", error);
      Alert.alert(
        "Lỗi",
        error.message || "Không thể tải danh sách bảo trì."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaintenanceData();
  }, [token]);

  const getStatusStyle = (status) => {
    switch (status) {
      case "Đang chờ":
        return styles.statusPending;
      case "Hoàn thành":
        return styles.statusCompleted;
      case "Từ chối":
        return styles.statusRejected;
      default:
        return {};
    }
  };

  const categoryMap = {
    plumbing: "Điện nước",
    electrical: "Điện",
    hvac: "Điều hòa",
    carpentry: "Mộc",
    cleaning: "Vệ sinh",
    other: "Khác",
  };

  const statusMap = {
    pending: "Đang chờ",
    completed: "Hoàn thành",
    rejected: "Từ chối",
  };

  const handleDelete = (requestId) => {
    Alert.alert(
      "Xác nhận",
      "Bạn chắc chắn muốn xóa yêu cầu này?",
      [
        {
          text: "Hủy",
          style: "cancel",
        },
        {
          text: "OK",
          onPress: async () => {
            try {
              await deleteMaintenanceRequest(requestId);
              Alert.alert("Thông báo", "Xóa thành công!");
              fetchMaintenanceData(); // refresh danh sách sau khi xóa
            } catch (error) {
              console.error("❌ Lỗi khi xóa yêu cầu:", error);
              Alert.alert("Lỗi", "Không thể xóa yêu cầu.");
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const renderMaintenanceItem = ({ item }) => (
    <View style={styles.maintenanceItem}>
      <Text style={styles.itemText}>ID Bảo trì: {item.request_id}</Text>
      <Text style={styles.itemText}>Ngày gửi đơn: {item.create_at}</Text>
      <Text style={styles.itemText}>
        Loại bảo trì: {categoryMap[item.category] || item.category}
      </Text>
      <Text style={styles.itemText}>Mô tả: {item.description}</Text>
      <Text style={styles.itemText}>Phòng: {item.roomName || "N/A"}</Text>
      <Text style={[styles.itemText, getStatusStyle(item.status)]}>
        Trạng thái: {statusMap[item.status] || item.status}
      </Text>

      {/* Hiển thị nút xóa nếu đang chờ */}
      {item.status === "pending" && (
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDelete(item.request_id)}
        >
          <Text style={styles.deleteButtonText}>Xóa</Text>
        </TouchableOpacity>
      )}
    </View>
  );

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
      <FlatList
        data={maintenanceData}
        keyExtractor={(item, index) => item.request_id?.toString() || index.toString()}
        contentContainerStyle={styles.listContainer}
        ListHeaderComponent={
          <>
            <Header />
            <View style={styles.content}>
              <Text style={styles.title}>Danh sách bảo trì</Text>
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.newRequestButton, { backgroundColor: colors.brand, flex: 1 }]}
                  onPress={() => navigation.navigate("CreateMaintenanceRequestScreen")}
                >
                  <Text style={styles.newRequestButtonText}>+ Tạo yêu cầu mới</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        }
        renderItem={renderMaintenanceItem}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 16 },
  buttonContainer: { flexDirection: "row", marginBottom: 16, alignItems: "center" },
  newRequestButton: { padding: 12, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  newRequestButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  listContainer: { paddingBottom: 16 },
  maintenanceItem: { backgroundColor: "#fff", padding: 16, borderRadius: 8, marginBottom: 12, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  itemText: { fontSize: 14, marginBottom: 4 },
  statusCompleted: { color: "green", fontWeight: "bold" },
  statusPending: { color: "orange", fontWeight: "bold" },
  statusRejected: { color: "red", fontWeight: "bold" },
  deleteButton: {
    marginTop: 8,
    backgroundColor: "#ff4d4d",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  deleteButtonText: { color: "#fff", fontWeight: "bold" },
});

export default MaintenanceListScreen;
