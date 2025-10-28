import React, { useContext, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import Header from "../../components/Header";
import { spacing } from "../../theme/spacing";
import { BillContext } from "../../contexts/BillContext";

export default function TransactionHistoryScreen() {
  const { transactionList } = useContext(BillContext);
  const [search, setSearch] = useState("");
  const [showFilterOptions, setShowFilterOptions] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("Tất cả");

  /** Lọc dữ liệu theo từ khóa và trạng thái */
  const filteredTransactions = transactionList.filter((t) => {
    const matchId = t.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      selectedFilter === "Tất cả" || t.status === selectedFilter;
    return matchId && matchStatus;
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={{ paddingBottom: spacing.lg }}>
        <Header />
      </View>

      {/* Tiêu đề */}
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Lịch sử giao dịch</Text>
      </View>

      {/* Khung danh sách giao dịch */}
      <View style={styles.box}>
        <ScrollView>
          {filteredTransactions.map((item) => (
            <View key={item.id} style={styles.transactionItem}>
              <Text style={styles.text}>ID: {item.id}</Text>
              <Text style={styles.text}>Thời gian: {item.time}</Text>
              <Text style={styles.text}>Số hóa đơn: {item.invoiceCount}</Text>
              <Text
                style={[
                  styles.text,
                  item.status === "Thành công"
                    ? styles.statusSuccess
                    : styles.statusFailed,
                ]}
              >
                Tình trạng: {item.status}
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Thanh tìm kiếm + nút lọc */}
      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Tìm theo ID"
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
        />
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilterOptions(!showFilterOptions)}
        >
          <MaterialIcons name="filter-list" size={22} color="#fff" />
          <Text style={styles.filterText}>Lọc</Text>
        </TouchableOpacity>
      </View>

      {/* Menu chọn trạng thái */}
      {showFilterOptions && (
        <View style={styles.filterMenu}>
          {["Tất cả", "Thành công", "Thất bại"].map((status) => (
            <TouchableOpacity
              key={status}
              style={[
                styles.filterOption,
                selectedFilter === status && styles.activeFilterOption,
              ]}
              onPress={() => {
                setSelectedFilter(status);
                setShowFilterOptions(false);
              }}
            >
              <Text
                style={[
                  styles.filterOptionText,
                  selectedFilter === status && styles.activeFilterText,
                ]}
              >
                {status}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingHorizontal: 16 },
  titleContainer: { alignItems: "center", marginBottom: 10 },
  title: { fontSize: 18, fontWeight: "bold", color: "#000" },
  box: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
    height: 380,
  },
  transactionItem: {
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    paddingBottom: 6,
  },
  text: { fontSize: 14, color: "#000" },
  statusSuccess: { color: "green", fontWeight: "600" },
  statusFailed: { color: "red", fontWeight: "600" },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 20,
    paddingHorizontal: 10,
    height: 36,
    marginRight: 8,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#004AAD",
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  filterText: { color: "#fff", fontWeight: "600", marginLeft: 4 },
  filterMenu: {
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 10,
    overflow: "hidden",
  },
  filterOption: {
    paddingVertical: 10,
    alignItems: "center",
  },
  activeFilterOption: {
    backgroundColor: "#004AAD",
  },
  filterOptionText: { color: "#000", fontWeight: "500" },
  activeFilterText: { color: "#fff" },
});
