import React, { useEffect, useMemo, useState, useCallback } from "react";
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
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import Header from "../../components/Header";
import { spacing } from "../../theme/spacing";
import { colors } from "../../theme/colors";
import { getAllTenantBills } from "../../service/api/tenant";

// Helper to format date cleanly (DD/MM/YYYY)
const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN");
};

// Helper to format currency (1.000.000 đ)
const VND = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
});

const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) return "0 đ";
  return VND.format(amount);
};

function BillListScreen() {
  const navigation = useNavigation();
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);

  const fetchBills = async () => {
    try {
      if (!refreshing) setLoading(true);
      setError("");
      const res = await getAllTenantBills();
      const list = res?.data || [];
      // Sort: Unpaid first, then by date desc
      list.sort((a, b) => {
        if (a.status === 'paid' && b.status !== 'paid') return 1;
        if (a.status !== 'paid' && b.status === 'paid') return -1;
        return new Date(b.created_at) - new Date(a.created_at);
      });
      setBills(list);
    } catch (err) {
      console.log("Error fetch bills:", err);
      setError("Không thể tải danh sách hóa đơn.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchBills();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchBills();
  };

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
    navigation.navigate("OnlinePaymentScreen", { bills: selectedBills });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <Header title="Hóa đơn" isHome={false} />

      <View style={styles.contentContainer}>
        {/* Top Info Row */}
        <View style={styles.topRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Danh sách hóa đơn</Text>
            <Text style={styles.subtitle}>Chọn hóa đơn để thanh toán</Text>
          </View>
          <TouchableOpacity
            style={styles.historyBadge}
            onPress={() => navigation.navigate("TransactionHistoryScreen")}
          >
            <Text style={styles.historyText}>Lịch sử GD</Text>
          </TouchableOpacity>
        </View>

        {loading && !refreshing ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color={colors.brand} />
          </View>
        ) : (
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.brand]} />
            }
          >
            {!loading && !error && bills.length === 0 && (
              <View style={styles.centerBox}>
                <Text style={{ color: colors.muted }}>Không có hóa đơn nào.</Text>
              </View>
            )}

            {bills.map((bill) => {
              const isSelected = selectedIds.includes(bill.bill_id);
              const isPaid = bill.status === "paid";
              const isOverdue = bill.status === "overdue";

              return (
                <TouchableOpacity
                  key={bill.bill_id}
                  style={[
                    styles.billCard,
                    isSelected && styles.billCardSelected,
                    isPaid && { opacity: 0.6 }
                  ]}
                  onPress={() => toggleSelect(bill.bill_id)}
                  activeOpacity={0.8}
                  disabled={isPaid}
                >
                  {/* Header: ID + Status */}
                  <View style={styles.cardHeader}>
                    <Text style={styles.billTitle}>
                      #{bill.bill_number || bill.bill_id}
                    </Text>
                    <View
                      style={[
                        styles.statusBadge,
                        isPaid && { backgroundColor: "#DCFCE7" },
                        isOverdue && { backgroundColor: "#FEE2E2" },
                        bill.status === "pending" && { backgroundColor: "#FEF3C7" },
                      ]}
                    >
                      <Text style={[
                        styles.statusText,
                        isPaid && { color: "#16A34A" },
                        isOverdue && { color: "#EF4444" },
                        bill.status === "pending" && { color: "#D97706" },
                      ]}>
                        {bill.status === 'paid' ? 'Đã thanh toán' : bill.status === 'overdue' ? 'Quá hạn' : 'Chưa thanh toán'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.divider} />

                  {/* Row 1: Period */}
                  <View style={styles.row}>
                    <Text style={styles.label}>Kỳ thanh toán:</Text>
                    <Text style={styles.value}>
                      {formatDate(bill.billing_period_start)} - {formatDate(bill.billing_period_end)}
                    </Text>
                  </View>

                  {/* Description Block - Full Text */}
                  {/* Changed from Row to Vertical Block to support long text */}
                  <View style={styles.descriptionBlock}>
                    <Text style={styles.label}>Nội dung:</Text>
                    <Text style={styles.descriptionText}>
                      {bill.description || ""}
                    </Text>
                  </View>

                  {/* Row 3: Amount */}
                  <View style={[styles.row, { marginTop: 4 }]}>
                    <Text style={styles.label}>Số tiền:</Text>
                    <Text style={[styles.amountText, { color: colors.brand }]}>
                      {formatCurrency(bill.total_amount)}
                    </Text>
                  </View>

                  {isSelected && (
                    <Text style={styles.selectedLabel}>✓ Đã chọn</Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}

        {/* Bottom Floating Bar */}
        <View style={styles.bottomBar}>
          <View>
            <Text style={styles.totalLabel}>Tổng tiền:</Text>
            <Text style={styles.totalValue}>{formatCurrency(totalAmount)}</Text>
          </View>
          <TouchableOpacity
            style={[
              styles.payButton,
              (!selectedIds.length) && styles.payButtonDisabled,
            ]}
            disabled={!selectedIds.length}
            onPress={handleGoToPayment}
          >
            <Text style={styles.payButtonText}>Thanh toán ({selectedIds.length})</Text>
          </TouchableOpacity>
        </View>
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
    overflow: "hidden"
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  title: { fontSize: 18, fontWeight: "700", color: "#111827" },
  subtitle: { fontSize: 13, color: "#6B7280", marginTop: 2 },
  historyBadge: {
    backgroundColor: "white",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  historyText: { fontSize: 12, color: colors.brand, fontWeight: "600" },
  centerBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  billCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    borderWidth: 1,
    borderColor: "transparent",
  },
  billCardSelected: { borderColor: colors.brand, backgroundColor: "#EFF6FF" },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  billTitle: { fontSize: 16, fontWeight: "700", color: "#111827" },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: "700", textTransform: "uppercase" },
  divider: { height: 1, backgroundColor: "#F3F4F6", marginBottom: 8 },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  label: { fontSize: 13, color: "#6B7280", flex: 1 },
  value: { fontSize: 13, color: "#111827", fontWeight: "500", flex: 2, textAlign: 'right' },

  // New Description Styles
  descriptionBlock: {
    marginBottom: 6,
  },
  descriptionText: {
    fontSize: 13,
    color: "#374151",
    marginTop: 2,
    lineHeight: 18 // Better readability for long text
  },

  amountText: { fontSize: 15, fontWeight: "700", textAlign: 'right', flex: 2 },
  selectedLabel: { marginTop: 8, fontSize: 12, color: colors.brand, fontWeight: "700", textAlign: 'right' },
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: "white",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: 30,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  totalLabel: { fontSize: 12, color: "#6B7280" },
  totalValue: { fontSize: 18, fontWeight: "800", color: colors.brand },
  payButton: { backgroundColor: colors.brand, paddingVertical: 12, paddingHorizontal: 24, borderRadius: 12 },
  payButtonDisabled: { backgroundColor: "#9CA3AF" },
  payButtonText: { color: "white", fontWeight: "700", fontSize: 15 },
});

export default BillListScreen;
