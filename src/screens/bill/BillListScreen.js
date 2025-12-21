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

// Filter Definitions
const FILTER_OPTIONS = [
  { key: 'all', label: 'Tất cả' },
  { key: 'pending', label: 'Chưa thanh toán' },
  { key: 'overdue', label: 'Quá hạn' },
  { key: 'paid', label: 'Đã thanh toán' },
  { key: 'cancelled', label: 'Đã hủy' },
];

function BillListScreen() {
  const navigation = useNavigation();
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  
  // NEW: Filter State
  const [filterStatus, setFilterStatus] = useState('all');

  const fetchBills = async () => {
    try {
      if (!refreshing) setLoading(true);
      setError("");
      const res = await getAllTenantBills();
      const list = res?.data || [];
      
      // Sort: Actionable (Pending/Overdue) first, then History (Paid/Cancelled)
      list.sort((a, b) => {
        const isHistoryA = a.status === 'paid' || a.status === 'cancelled';
        const isHistoryB = b.status === 'paid' || b.status === 'cancelled';

        if (isHistoryA && !isHistoryB) return 1; 
        if (!isHistoryA && isHistoryB) return -1; 
        
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

  // NEW: Filter Logic
  const filteredBills = useMemo(() => {
    if (filterStatus === 'all') return bills;
    return bills.filter((b) => b.status === filterStatus);
  }, [bills, filterStatus]);

  // Calculate Total from Selected (Available in Filtered View)
  const totalAmount = useMemo(() => {
    // We only sum up selected bills that are currently visible
    return filteredBills
      .filter((b) => selectedIds.includes(b.bill_id))
      .reduce((sum, b) => sum + (b.total_amount || 0), 0);
  }, [filteredBills, selectedIds]);

  const handleGoToPayment = () => {
    const selectedBills = bills.filter((b) => selectedIds.includes(b.bill_id));
    if (!selectedBills.length) return;
    navigation.navigate("OnlinePaymentScreen", { bills: selectedBills });
  };

  const getStatusInfo = (status) => {
      switch (status) {
          case 'paid': 
              return { label: 'Đã thanh toán', bg: '#DCFCE7', text: '#16A34A' };
          case 'overdue':
              return { label: 'Quá hạn', bg: '#FEE2E2', text: '#EF4444' };
          case 'cancelled':
              return { label: 'Đã hủy', bg: '#F3F4F6', text: '#6B7280' };
          default:
              return { label: 'Chưa thanh toán', bg: '#FEF3C7', text: '#D97706' };
      }
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

        {/* NEW: Filter Chips */}
        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 20 }}>
            {FILTER_OPTIONS.map((option) => {
              const isActive = filterStatus === option.key;
              return (
                <TouchableOpacity
                  key={option.key}
                  onPress={() => setFilterStatus(option.key)}
                  style={[styles.filterChip, isActive && styles.filterChipActive]}
                >
                  <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
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
            {!loading && !error && filteredBills.length === 0 && (
                <View style={styles.centerBox}>
                    <Text style={{ color: colors.muted, marginTop: 40 }}>Không có hóa đơn nào.</Text>
                </View>
            )}

            {filteredBills.map((bill) => {
              const isSelected = selectedIds.includes(bill.bill_id);
              const isPaid = bill.status === "paid";
              const isCancelled = bill.status === "cancelled";
              
              const statusInfo = getStatusInfo(bill.status);
              const isDisabled = isPaid || isCancelled;

              return (
                <TouchableOpacity
                  key={bill.bill_id}
                  style={[
                    styles.billCard,
                    isSelected && styles.billCardSelected,
                    isDisabled && { opacity: 0.6 }
                  ]}
                  onPress={() => toggleSelect(bill.bill_id)}
                  activeOpacity={0.8}
                  disabled={isDisabled}
                >
                  <View style={styles.cardHeader}>
                    <Text style={styles.billTitle}>
                      #{bill.bill_number || bill.bill_id}
                    </Text>
                    <View
                        style={[
                            styles.statusBadge,
                            { backgroundColor: statusInfo.bg }
                        ]}
                    >
                        <Text style={[
                            styles.statusText,
                            { color: statusInfo.text }
                        ]}>
                            {statusInfo.label}
                        </Text>
                    </View>
                  </View>
                  
                  <View style={styles.divider} />

                  <View style={styles.row}>
                    <Text style={styles.label}>Kỳ thanh toán:</Text>
                    <Text style={styles.value}>
                       {formatDate(bill.billing_period_start)} - {formatDate(bill.billing_period_end)}
                    </Text>
                  </View>

                  <View style={styles.descriptionBlock}>
                    <Text style={styles.label}>Nội dung:</Text>
                    <Text style={styles.descriptionText}>
                       {bill.description || ""}
                    </Text>
                  </View>
                  
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
    marginBottom: spacing.sm,
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
  
  // FILTER STYLES
  filterContainer: {
    marginBottom: 16,
    height: 40,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "white",
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    justifyContent: 'center'
  },
  filterChipActive: {
    backgroundColor: colors.brand,
    borderColor: colors.brand,
  },
  filterText: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "600"
  },
  filterTextActive: {
    color: "white"
  },

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
  
  descriptionBlock: {
      marginBottom: 6,
  },
  descriptionText: {
      fontSize: 13,
      color: "#374151",
      marginTop: 2,
      lineHeight: 18
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
