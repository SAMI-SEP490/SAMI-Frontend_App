import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  StatusBar
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import Header from "../../components/Header";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";

const MaintenanceListScreen = () => {
  const navigation = useNavigation();
  // Placeholder data

  const maintenanceData = [
    {
      id: "MTN0001",
      date: "18/07/2025",
      type: "Dịch vụ",
      description: "Internet phòng 101 có vấn đề",
      room: "Phòng 101",
      status: "Hoàn thành",
    },
    {
      id: "MTN0002",
      date: "25/07/2025",
      type: "Kiểm tra",
      description: "Điều hòa phòng 102 không hoạt động",
      room: "Phòng 102",
      status: "Đang chờ",
    },
    {
      id: "MTN0003",
      date: "10/08/2025",
      type: "Sửa chữa",
      description: "Bóng đèn phòng 103 bị hỏng",
      room: "Phòng 103",
      status: "Hoàn thành",
    },
    {
      id: "MTN0004",
      date: "05/09/2025",
      type: "Dịch vụ",
      description: "Nước phòng 104 bị rò rỉ",
      room: "Phòng 104",
      status: "Đang chờ",
    },
    {
      id: "MTN0005",
      date: "18/09/2025",
      type: "Dịch vụ",
      description: "Internet phòng 105 có vấn đề",
      room: "Phòng 105",
      status: "Hoàn thành",
    },
  ];

  const [filteredData, setFilteredData] = useState(maintenanceData);
  const [filterType, setFilterType] = useState(null);
  const [filterStatus, setFilterStatus] = useState(null);

  useEffect(() => {
    let data = maintenanceData;
    if (filterType) {
      data = data.filter((item) => item.type === filterType);
    }
    if (filterStatus) {
      data = data.filter((item) => item.status === filterStatus);
    }
    setFilteredData(data);
  }, [filterType, filterStatus]);

  const showFilterOptions = () => {
    Alert.alert(
      "Lọc danh sách",
      "Chọn tiêu chí để lọc",
      [
        {
          text: "Lọc theo Loại bảo trì",
          onPress: showTypeFilter,
        },
        {
          text: "Lọc theo Trạng thái",
          onPress: showStatusFilter,
        },
        {
          text: "Xóa bộ lọc",
          onPress: () => {
            setFilterType(null);
            setFilterStatus(null);
          },
          style: "destructive",
        },
        {
          text: "Hủy",
          style: "cancel",
        },
      ],
      { cancelable: true },
    );
  };

  const showTypeFilter = () => {
    const types = [...new Set(maintenanceData.map((item) => item.type))];
    const options = types.map((type) => ({
      text: type,
      onPress: () => setFilterType(type),
    }));
    options.push({ text: "Hủy", style: "cancel" });
    Alert.alert("Chọn loại bảo trì", "", options, { cancelable: true });
  };

  const showStatusFilter = () => {
    const statuses = [...new Set(maintenanceData.map((item) => item.status))];
    const options = statuses.map((status) => ({
      text: status,
      onPress: () => setFilterStatus(status),
    }));
    options.push({ text: "Hủy", style: "cancel" });
    Alert.alert("Chọn trạng thái", "", options, { cancelable: true });
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "Hoàn thành":
        return styles.statusCompleted;
      case "Đang chờ":
        return styles.statusPending;
      case "Từ chối":
        return styles.statusRejected;
      default:
        return {};
    }
  };

  const renderMaintenanceItem = ({ item }) => (
    <View style={styles.maintenanceItem}>
      <Text style={styles.itemText}>ID Bảo trì: {item.id}</Text>
      <Text style={styles.itemText}>Ngày bảo trì: {item.date}</Text>
      <Text style={styles.itemText}>Loại bảo trì: {item.type}</Text>
      <Text style={styles.itemText}>Mô tả: {item.description}</Text>
      <Text style={styles.itemText}>Phòng: {item.room}</Text>
      <Text style={[styles.itemText, getStatusStyle(item.status)]}>
        Trạng thái: {item.status}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Header />
      <View style={styles.content}>
        <Text style={styles.title}>Danh sách bảo trì</Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.newRequestButton,
              { backgroundColor: colors.brand, flex: 1, marginRight: 8 },
            ]}
            onPress={() =>
              navigation.navigate("CreateMaintenanceRequestScreen")
            }
          >
            <Text style={styles.newRequestButtonText}>+ Tạo yêu cầu mới</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={showFilterOptions}
          >
            <Ionicons name="filter" size={16} color="#333" />
            <Text style={styles.filterButtonText}>Lọc</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={filteredData}
          renderItem={renderMaintenanceItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "left",
  },
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
    justifyContent: "center",
  },
  filterButtonText: {
    color: "#333",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  newRequestButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  listContainer: {
    paddingBottom: 16,
  },
  maintenanceItem: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  itemText: {
    fontSize: 14,
    marginBottom: 4,
  },
  statusCompleted: {
    color: "green",
    fontWeight: "bold",
  },
  statusPending: {
    color: "orange",
    fontWeight: "bold",
  },
  statusRejected: {
    color: "red",
    fontWeight: "bold",
  },
});

export default MaintenanceListScreen;
