// src/screens/bill/BillListScreen.js
import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Header from "../../components/Header";
import { spacing } from "../../theme/spacing";
import { colors } from "../../theme/colors";
import { getAllTenantBills } from "../../service/api/tenant";

function BillListScreen() {
  const navigation = useNavigation();
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);

  const fetchBills = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getAllTenantBills();
      // unwrap() trả về res.data từ axios, trong đó backend là { success, data }
      const list = res?.data || [];
      setBills(Array.isArray(list) ? list : []);
    } catch (err) {
      console.log("Error fetch tenant bills:", err.message);
      setError(err.message || "Không thể tải danh sách hóa đơn.");
      setBills([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, []);

  const toggleSelect = (billId) => {
    setSelectedIds((prev) =>
      prev.includes(billId)
        ? prev.filter((id) => id !== billId)
        : [...prev, billId]
    );
  };

  const totalAmount = useMemo(() => {
    return bills
      .filter((b) => selectedIds.includes(b.bill_id))
      .reduce((sum, b) => sum + (b.total_amount || 0), 0);
  }, [bills, selectedIds]);

  const handleGoToPayment = () => {
    const selectedBills = bills.filter((b) => selectedIds.includes(b.bill_id));
    if (!selectedBills.length) return;
    navigation.navigate("OnlinePaymentScreen", {
      bills: selectedBills,
    });
  };

  const handleTransactionHistory = () => {
    navigation.navigate("TransactionHistoryScreen");
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Header />

      <View style={styles.content}>
        {/* Thanh tiêu đề + nút lịch sử */}
        <View style={styles.topRow}>
          <View>
            <Text style={styles.title}>Danh sách hóa đơn</Text>
            <Text style={styles.subtitle}>
              Bạn có thể tích nhiều hóa đơn để thanh toán
            </Text>
          </View>
          <TouchableOpacity
            style={styles.historyBadge}
            onPress={handleTransactionHistory}
          >
            <Text style={styles.historyText}>Lịch sử giao dịch</Text>
          </TouchableOpacity>
        </View>

        {/* Nội dung chính */}
        {loading && (
          <View style={styles.centerBox}>
            <ActivityIndicator size="small" color={colors.brand} />
            <Text style={{ marginTop: 8 }}>Đang tải dữ liệu...</Text>
          </View>
        )}

        {!loading && error ? (
          <View style={styles.centerBox}>
            <Text style={{ color: "red", textAlign: "center" }}>{error}</Text>
          </View>
        ) : null}

        {!loading && !error && !bills.length && (
          <View style={styles.centerBox}>
            <Text>Hiện chưa có hóa đơn nào để thanh toán.</Text>
          </View>
        )}

        {!loading && !error && !!bills.length && (
          <ScrollView style={{ flex: 1 }}>
            {bills.map((bill) => {
              const isSelected = selectedIds.includes(bill.bill_id);
              return (
                <TouchableOpacity
                  key={bill.bill_id}
                  style={[
                    styles.billCard,
                    isSelected && styles.billCardSelected,
                  ]}
                  onPress={() => toggleSelect(bill.bill_id)}
                  activeOpacity={0.8}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                    }}
                  >
                    <Text style={styles.billTitle}>
                      Hóa đơn #{bill.bill_number || bill.bill_id}
                    </Text>
                    <Text
                      style={[
                        styles.statusBadge,
                        bill.status === "overdue" && {
                          backgroundColor: "#F97316",
                        },
                        bill.status === "paid" && {
                          backgroundColor: colors.success,
                        },
                      ]}
                    >
                      {bill.status}
                    </Text>
                  </View>
                  <Text style={styles.billText}>
                    Kỳ: {bill.billing_period_start} - {bill.billing_period_end}
                  </Text>
                  <Text style={styles.billText}>
                    Số tiền: {bill.total_amount} đ
                  </Text>
                  {isSelected && (
                    <Text style={styles.selectedLabel}>Đã chọn</Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}

        {/* Thanh tổng & nút thanh toán */}
        <View style={styles.bottomBar}>
          <View>
            <Text style={styles.totalLabel}>Tổng tiền:</Text>
            <Text style={styles.totalValue}>{totalAmount} đ</Text>
          </View>
          <TouchableOpacity
            style={[
              styles.payButton,
              (!selectedIds.length || !bills.length) &&
                styles.payButtonDisabled,
            ]}
            disabled={!selectedIds.length || !bills.length}
            onPress={handleGoToPayment}
          >
            <Text style={styles.payButtonText}>Thanh toán</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F172A", // nền xanh đậm như các màn khác
  },
  content: {
    flex: 1,
    backgroundColor: "#F1F5F9",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
  },
  subtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 4,
  },
  historyBadge: {
    backgroundColor: "#E5E7EB",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  historyText: {
    fontSize: 12,
    color: "#111827",
    fontWeight: "600",
  },
  centerBox: {
    marginTop: spacing.xl,
    alignItems: "center",
    justifyContent: "center",
  },
  billCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  billCardSelected: {
    borderWidth: 1,
    borderColor: colors.brand,
  },
  billTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 4,
  },
  billText: {
    fontSize: 13,
    color: "#4B5563",
    marginTop: 2,
  },
  selectedLabel: {
    marginTop: 6,
    fontSize: 12,
    color: colors.brand,
    fontWeight: "600",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#E5E7EB",
    fontSize: 11,
    color: "#111827",
    alignSelf: "flex-start",
    textTransform: "uppercase",
  },
  bottomBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.md,
  },
  totalLabel: {
    fontSize: 14,
    color: "#4B5563",
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  payButton: {
    backgroundColor: "#22C55E",
    paddingVertical: 10,
    paddingHorizontal: 40,
    borderRadius: 999,
  },
  payButtonDisabled: {
    opacity: 0.5,
  },
  payButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
  },
});

export default BillListScreen;
