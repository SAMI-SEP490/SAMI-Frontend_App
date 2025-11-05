import React, { useContext, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
} from "react-native";
import Header from "../../components/Header";
import { spacing } from "../../theme/spacing";
import { BillContext } from "../../contexts/BillContext";
import { useNavigation } from "@react-navigation/native";

export default function BillListScreen() {
  const { billData, setIdBillListPayment } = useContext(BillContext);
  const [selectedIds, setSelectedIds] = useState([]);
  const navigation = useNavigation();

  /** Toggle chọn/bỏ chọn hóa đơn chưa trả */
  const toggleSelection = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  /** Điều hướng sang màn thanh toán */
  const handlePayment = () => {
    const unpaidSelected = billData.filter(
      (b) => selectedIds.includes(b.id) && b.status === "Chưa trả"
    );
    if (unpaidSelected.length === 0) return;

    setIdBillListPayment(selectedIds);
    navigation.navigate("OnlinePaymentScreen");
  };

  /** Điều hướng sang màn lịch sử giao dịch */
  const handleTransactionHistory = () => {
    navigation.navigate("TransactionHistoryScreen");
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={{ paddingBottom: spacing.lg }}>
        <Header />
      </View>

      {/* Nút lịch sử giao dịch */}
      <View style={styles.historyButtonContainer}>
        <TouchableOpacity
          style={styles.historyButton}
          onPress={handleTransactionHistory}
        >
          <Text style={styles.historyButtonText}>Lịch sử giao dịch</Text>
        </TouchableOpacity>
      </View>

      {/* Tiêu đề */}
      <View style={styles.titleContainer}>
        <Text style={styles.titleText}>
          Bạn có thể tích nhiều hóa đơn để thanh toán
        </Text>
      </View>

      {/* Danh sách hóa đơn */}
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16 }}>
        {billData.map((bill) => {
          const isSelected = selectedIds.includes(bill.id);
          const isUnpaid = bill.status === "Chưa trả";
          return (
            <View
              key={bill.id}
              style={[styles.billContainer, { opacity: isUnpaid ? 1 : 0.7 }]}
            >
              {/* Checkbox chỉ hiển thị nếu hóa đơn chưa trả */}
              {isUnpaid ? (
                <TouchableOpacity
                  style={styles.checkboxContainer}
                  onPress={() => toggleSelection(bill.id)}
                  activeOpacity={0.8}
                >
                  <View
                    style={[
                      styles.checkbox,
                      isSelected && styles.checkboxSelected,
                    ]}
                  >
                    {isSelected && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                </TouchableOpacity>
              ) : (
                <View style={styles.checkboxPlaceholder} />
              )}

              {/* Thông tin hóa đơn */}
              <View style={styles.billContent}>
                <Text style={styles.billText}>
                  Tên: <Text style={styles.billValue}>{bill.name}</Text>
                </Text>
                <Text style={styles.billText}>
                  Loại: <Text style={styles.billValue}>{bill.category}</Text>
                </Text>
                <Text style={styles.billText}>
                  Mốc thời gian:{" "}
                  <Text style={styles.billValue}>{bill.period}</Text>
                </Text>
                <Text style={styles.billText}>
                  Chi phí:{" "}
                  <Text style={[styles.billValue, { color: "#007bff" }]}>
                    {bill.expense} VNĐ
                  </Text>
                </Text>
                <Text
                  style={[
                    styles.billText,
                    bill.status === "Đã trả"
                      ? styles.statusPaid
                      : styles.statusUnpaid,
                  ]}
                >
                  Tình trạng: {bill.status}
                </Text>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Tổng tiền đã chọn */}
      {selectedIds.length > 0 && (
        <View style={styles.totalContainer}>
          <Text style={styles.totalText}>
            Tổng tiền:{" "}
            <Text style={{ fontWeight: "bold", color: "#007bff" }}>
              {billData
                .filter(
                  (bill) =>
                    selectedIds.includes(bill.id) && bill.status === "Chưa trả"
                )
                .reduce((sum, bill) => sum + Number(bill.expense || 0), 0)
                .toLocaleString()}{" "}
              VNĐ
            </Text>
          </Text>
        </View>
      )}

      {/* Nút thanh toán */}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[
            styles.payButton,
            selectedIds.length === 0 && { opacity: 0.6 },
          ]}
          disabled={selectedIds.length === 0}
          onPress={handlePayment}
        >
          <Text style={styles.buttonText}>Thanh Toán</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  historyButtonContainer: {
    alignItems: "center",
    marginBottom: 10,
  },
  historyButton: {
    backgroundColor: "#004AAD",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  historyButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  titleContainer: { alignItems: "center", marginBottom: 10 },
  titleText: { fontSize: 16, fontWeight: "600", color: "#000" },
  billContainer: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  checkboxContainer: { marginRight: 10, marginTop: 8 },
  checkboxPlaceholder: { width: 20, height: 20, marginRight: 10, marginTop: 8 },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#555",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxSelected: {
    backgroundColor: "#007bff",
    borderColor: "#007bff",
  },
  checkmark: { color: "#fff", fontWeight: "bold" },
  billContent: { flex: 1 },
  billText: { fontSize: 14, marginBottom: 2 },
  billValue: { fontWeight: "600" },
  statusPaid: { color: "green" },
  statusUnpaid: { color: "red" },
  totalContainer: { alignItems: "center", marginBottom: 8 },
  totalText: { fontSize: 16, fontWeight: "500" },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 16,
  },
  payButton: {
    backgroundColor: "#7ED957",
    paddingVertical: 10,
    paddingHorizontal: 50,
    borderRadius: 8,
  },
  buttonText: { color: "#fff", fontWeight: "bold" },
});
