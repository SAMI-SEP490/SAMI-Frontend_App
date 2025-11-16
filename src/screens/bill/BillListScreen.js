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
import { getAllTenantBills } from "../../service/api/tenant";

export default function BillListScreen() {
  const navigation = useNavigation();

  const [bills, setBills] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Gọi API lấy danh sách hóa đơn của Tenant
  useEffect(() => {
    let isMounted = true;

    async function fetchBills() {
      setLoading(true);
      setError("");
      try {
        const data = await getAllTenantBills();
        let list = [];

        if (Array.isArray(data)) {
          list = data;
        } else if (Array.isArray(data?.items)) {
          list = data.items;
        }

        if (isMounted) setBills(list);
      } catch (e) {
        if (isMounted) {
          const msg =
            e?.response?.data?.message ||
            e?.message ||
            "Không tải được danh sách hóa đơn";
          setError(msg);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchBills();

    return () => {
      isMounted = false;
    };
  }, []);

  const selectedBills = useMemo(
    () =>
      bills.filter((bill, idx) => selectedIds.includes(getBillKey(bill, idx))),
    [bills, selectedIds]
  );

  const totalAmount = useMemo(
    () =>
      selectedBills.reduce((sum, b) => {
        const amt = getBillAmount(b);
        return sum + (Number.isFinite(amt) ? amt : 0);
      }, 0),
    [selectedBills]
  );

  const toggleSelect = (bill, index) => {
    const id = getBillKey(bill, index);
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handlePay = () => {
    if (!selectedBills.length) return;

    navigation.navigate("OnlinePaymentScreen", {
      bills: selectedBills,
      totalAmount,
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
          <Text style={styles.screenTitle}>
            Danh sách hóa đơn chưa thanh toán
          </Text>
          <TouchableOpacity
            style={styles.historyButton}
            onPress={handleTransactionHistory}
          >
            <Text style={styles.historyButtonText}>Lịch sử giao dịch</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.subtitle}>
          Bạn có thể tích nhiều hóa đơn để thanh toán
        </Text>

        {/* Thông báo lỗi */}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {/* Loading */}
        {loading && (
          <View style={styles.centerBox}>
            <ActivityIndicator size="small" />
            <Text style={{ marginTop: 8 }}>Đang tải dữ liệu...</Text>
          </View>
        )}

        {/* Danh sách hóa đơn */}
        {!loading && !bills.length && !error && (
          <View style={styles.centerBox}>
            <Text>Hiện chưa có hóa đơn nào.</Text>
          </View>
        )}

        {!loading && !!bills.length && (
          <ScrollView
            style={styles.list}
            contentContainerStyle={{ paddingBottom: spacing.xxl }}
          >
            {bills.map((bill, index) => {
              const id = getBillKey(bill, index);
              const isSelected = selectedIds.includes(id);

              return (
                <TouchableOpacity
                  key={id}
                  style={[
                    styles.billCard,
                    isSelected && styles.billCardSelected,
                  ]}
                  activeOpacity={0.8}
                  onPress={() => toggleSelect(bill, index)}
                >
                  <View style={styles.billRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.billName}>
                        {getBillName(bill, index)}
                      </Text>
                      <Text style={styles.billPeriod}>
                        {getBillPeriod(bill)}
                      </Text>
                    </View>

                    <View style={{ alignItems: "flex-end" }}>
                      <Text style={styles.billAmount}>
                        {formatCurrency(getBillAmount(bill))}
                      </Text>
                      <Text style={styles.billStatus}>
                        {getBillStatus(bill)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.checkboxRow}>
                    <View
                      style={[
                        styles.checkbox,
                        isSelected && styles.checkboxChecked,
                      ]}
                    >
                      {isSelected && <Text style={styles.checkboxTick}>✓</Text>}
                    </View>
                    <Text style={styles.checkboxLabel}>Chọn hóa đơn này</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}

        {/* Tổng tiền + nút thanh toán */}
        <View style={styles.footer}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Tổng tiền:</Text>
            <Text style={styles.totalValue}>{formatCurrency(totalAmount)}</Text>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[
                styles.payButton,
                !selectedBills.length && styles.payButtonDisabled,
              ]}
              activeOpacity={0.8}
              disabled={!selectedBills.length}
              onPress={handlePay}
            >
              <Text style={styles.buttonText}>Thanh toán</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

/* ================= Helpers ================= */

function getBillKey(bill, index) {
  return String(
    bill.id ??
      bill.bill_id ??
      bill.billId ??
      bill.code ??
      bill.uuid ??
      `bill-${index}`
  );
}

function getBillName(bill, index) {
  const baseName =
    bill.name ??
    bill.bill_name ??
    bill.billName ??
    bill.title ??
    `Hóa đơn #${index + 1}`;

  const periodText = getBillPeriod(bill);
  if (periodText) return `${baseName} (${periodText})`;

  return baseName;
}

function getBillPeriod(bill) {
  const start =
    bill.billing_period_start ??
    bill.period_start ??
    bill.start_date ??
    bill.startDate;
  const end =
    bill.billing_period_end ?? bill.period_end ?? bill.end_date ?? bill.endDate;

  if (!start && !end) return "";

  const s = start ? formatDateShort(start) : "?";
  const e = end ? formatDateShort(end) : "?";
  return `${s} - ${e}`;
}

function getBillStatus(bill) {
  const raw =
    bill.status ??
    bill.bill_status ??
    bill.payment_status ??
    bill.state ??
    bill.billState;

  const status = String(raw || "").toLowerCase();

  if (!status) return "Không rõ";

  if (["paid", "completed", "settled", "success"].includes(status))
    return "Đã thanh toán";

  if (["unpaid", "pending"].includes(status)) return "Chưa thanh toán";

  if (["canceled", "cancelled"].includes(status)) return "Đã hủy";

  return raw;
}

function getBillAmount(bill) {
  const candidates = [
    bill.total_amount,
    bill.amount,
    bill.total,
    bill.total_money,
    bill.totalMoney,
    bill.grand_total,
  ];

  for (const v of candidates) {
    const n = Number(v);
    if (Number.isFinite(n)) return n;
  }
  return 0;
}

function formatDateShort(value) {
  if (!value) return "";
  const s = String(value).slice(0, 10); // YYYY-MM-DD...
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    const [y, m, d] = s.split("-");
    return `${d}/${m}/${y}`;
  }
  return s;
}

function formatCurrency(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return "0 đ";
  try {
    return n.toLocaleString("vi-VN") + " đ";
  } catch {
    return `${n} đ`;
  }
}

/* ================= Styles ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F172A",
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
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  screenTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
  },
  historyButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#E2E8F0",
  },
  historyButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#0F172A",
  },
  subtitle: {
    fontSize: 13,
    color: "#64748B",
    marginBottom: spacing.md,
  },
  errorText: {
    color: "#DC2626",
    marginBottom: spacing.sm,
  },
  list: {
    flex: 1,
  },
  centerBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.lg,
  },
  billCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  billCardSelected: {
    borderColor: "#22C55E",
    backgroundColor: "#ECFDF3",
  },
  billRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  billName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: 4,
  },
  billPeriod: {
    fontSize: 12,
    color: "#64748B",
  },
  billAmount: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
  },
  billStatus: {
    marginTop: 4,
    fontSize: 12,
    color: "#16A34A",
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.sm,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#94A3B8",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    backgroundColor: "#FFFFFF",
  },
  checkboxChecked: {
    backgroundColor: "#22C55E",
    borderColor: "#16A34A",
  },
  checkboxTick: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  checkboxLabel: {
    fontSize: 12,
    color: "#475569",
  },
  footer: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#0F172A",
  },
  totalValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },
  buttonRow: {
    justifyContent: "center",
    alignItems: "center",
  },
  payButton: {
    backgroundColor: "#22C55E",
    paddingVertical: 10,
    paddingHorizontal: 50,
    borderRadius: 999,
  },
  payButtonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
  },
});
