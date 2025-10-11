import React, { useContext } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import Header from "../../components/Header";
import { spacing } from "../../theme/spacing";
import { GuestRegistrationContext } from "../../contexts/GuestRegistrationContext";
import { useNavigation } from "@react-navigation/native";

export default function GuestRegistrationList() {
  const { guestRegistration } = useContext(GuestRegistrationContext); // 👈 lấy data từ context
  const navigation = useNavigation();
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={{ paddingBottom: spacing.lg }}>
        <Header />
      </View>

      {/* Nút tạo đơn */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.addButton}>
          <Text
            style={styles.addButtonText}
            onPress={() => navigation.navigate("CreateGuestRegistration")}
          >
            Tạo đơn
          </Text>
        </TouchableOpacity>
      </View>

      {/* Header bảng */}
      <View style={styles.tableHeader}>
        <Text style={[styles.cell, styles.headerCell, { flex: 1 }]}>STT</Text>
        <Text style={[styles.cell, styles.headerCell, { flex: 3 }]}>
          Họ và tên
        </Text>
        <Text style={[styles.cell, styles.headerCell, { flex: 2 }]}>
          Trạng thái
        </Text>
        <Text style={[styles.cell, styles.headerCell, { flex: 2 }]}>
          Hành động
        </Text>
      </View>

      <ScrollView>
        {guestRegistration.map((guest, index) => (
          <View style={styles.tableRow} key={index}>
            <Text style={[styles.cell, { flex: 1 }]}>{index + 1}</Text>
            <Text style={[styles.cell, { flex: 3 }]}>{guest.name}</Text>
            <Text
              style={[
                styles.cell,
                {
                  flex: 2,
                  color: getStatusColor(guest.status),
                  fontWeight: "600",
                },
              ]}
            >
              {guest.status}
            </Text>
            <View
              style={[
                styles.cell,
                { flex: 2, flexDirection: "row", justifyContent: "center" },
              ]}
            >
              {guest.status === "Chờ xử lý" && (
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={() =>
                    navigation.navigate("UpdateGuestRegistration", { guest })
                  }
                >
                  <MaterialIcons name="edit" size={20} color="#007bff" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

/** Màu trạng thái */
const getStatusColor = (status) => {
  switch (status) {
    case "Chấp nhận":
      return "green";
    case "Từ chối":
      return "red";
    case "Chờ xử lý":
      return "orange";
    default:
      return "black";
  }
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 0, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 10,
  },
  addButton: {
    backgroundColor: "#007bff",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  addButtonText: { color: "#fff", fontWeight: "600" },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#e9ecef",
    paddingVertical: 10,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    paddingVertical: 10,
  },
  cell: { textAlign: "center" },
  headerCell: { fontWeight: "700" },
  iconButton: { marginHorizontal: 6 },
});
