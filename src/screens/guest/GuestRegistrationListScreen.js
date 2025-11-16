// src/screens/guest/GuestRegistrationListScreen.jsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Header from "../../components/Header";
import { spacing } from "../../theme/spacing";
import { getGuestRegistrations } from "../../service/api/guest";

export default function GuestRegistrationListScreen() {
  const navigation = useNavigation();

  const [guestRegistrations, setGuestRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // ===============================
  // Lấy danh sách guest registrations từ API
  // ===============================
  const fetchGuestRegistrations = async () => {
    try {
      setLoading(true);
      const res = await getGuestRegistrations({ page: 1, limit: 50 });
      const registrations = res?.data?.registrations || [];
      setGuestRegistrations(registrations);
    } catch (error) {
      console.error("Lỗi lấy danh sách đăng ký khách:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuestRegistrations();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchGuestRegistrations();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={{ paddingBottom: spacing.lg }}>
        <Header />
      </View>

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate("CreateGuestRegistrationScreen")}
        >
          <Text style={styles.addButtonText}>Tạo đơn đăng ký khách</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {guestRegistrations.length === 0 ? (
          <Text style={styles.noData}>Chưa có đăng ký khách nào</Text>
        ) : (
          guestRegistrations.map((guest, index) => (
            <View style={styles.card} key={guest.registration_id}>
              <Text style={styles.cardTitle}>Đơn #{index + 1}</Text>

              <Text>Số lượng khách: {guest.guest_count || 0}</Text>

              <Text>
                Tên khách:{" "}
                {guest.guest_details.map((g) => g.full_name).join(", ") || "-"}
              </Text>

              <Text>
                Ngày tạo đơn: {guest.created_at?.split("T")[0] || "-"}
              </Text>

              <Text>Ngày vào: {guest.arrival_date?.split("T")[0] || "-"}</Text>
              <Text>Ngày ra: {guest.departure_date?.split("T")[0] || "-"}</Text>

              <Text
                style={{
                  color: getStatusColor(mapStatus(guest.status)),
                  fontWeight: "600",
                }}
              >
                Trạng thái: {mapStatus(guest.status)}
              </Text>

              {guest.status === "pending" && (
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() =>
                    navigation.navigate("UpdateGuestRegistrationScreen", {
                      registrationId: guest.registration_id,
                    })
                  }
                >
                  <Text style={styles.editButtonText}>Chỉnh sửa</Text>
                </TouchableOpacity>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

// ===============================
// Map trạng thái backend -> hiển thị tiếng Việt
// ===============================
const mapStatus = (status) => {
  switch (status) {
    case "approved":
      return "Chấp nhận";
    case "rejected":
      return "Từ chối";
    case "pending":
      return "Chờ xử lý";
    case "cancelled":
      return "Đã hủy";
    default:
      return status;
  }
};

// ===============================
// Màu trạng thái
// ===============================
const getStatusColor = (status) => {
  switch (status) {
    case "Chấp nhận":
      return "green";
    case "Từ chối":
      return "red";
    case "Chờ xử lý":
      return "orange";
    case "Đã hủy":
      return "gray";
    default:
      return "black";
  }
};

// ===============================
// Styles
// ===============================
const styles = StyleSheet.create({
  container: { flex: 1, padding: 0, backgroundColor: "#fff" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 10,
    paddingHorizontal: 16,
  },
  addButton: {
    backgroundColor: "#007bff",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  addButtonText: { color: "#fff", fontWeight: "600" },
  card: {
    backgroundColor: "#f9f9f9",
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: { fontWeight: "700", marginBottom: 8 },
  editButton: {
    marginTop: 10,
    backgroundColor: "#007bff",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  editButtonText: { color: "#fff", fontWeight: "600" },
  noData: {
    textAlign: "center",
    marginTop: 20,
    color: "#777",
    fontStyle: "italic",
  },
});
