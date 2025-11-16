// src/screens/bill/OnlinePaymentScreen.js
import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import Header from "../../components/Header";
import { spacing } from "../../theme/spacing";

function OnlinePaymentScreen({ navigation, route }) {
  const params = route?.params || {};
  const bills = Array.isArray(params.bills) ? params.bills : [];
  const totalAmountFromRoute = Number(params.totalAmount ?? 0);

  // Tự tính lại cho chắc
  const totalAmount = useMemo(
    () =>
      bills.reduce((sum, b) => {
        const amt = getBillAmount(b);
        return sum + (Number.isFinite(amt) ? amt : 0);
      }, 0),
    [bills]
  );

  const finalTotal =
    Number.isFinite(totalAmount) && totalAmount > 0
      ? totalAmount
      : totalAmountFromRoute;

  const handleBack = () => {
    navigation.goBack();
  };

  const handleOnlinePayment = () => {
    navigation.navigate("VnpayWebViewScreen", {
      bills,
      totalAmount: finalTotal,
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Header />

      <View style={styles.content}>
        <Text style={styles.title}>Thanh toán online</Text>
        <Text style={styles.subtitle}>
          Kiểm tra lại thông tin các hóa đơn trước khi thanh toán.
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Danh sách hóa đơn</Text>
          {bills.length === 0 ? (
            <Text style={styles.emptyText}>
              Không có hóa đơn nào được chọn.
            </Text>
          ) : (
            <ScrollView
              style={styles.billList}
              contentContainerStyle={{ paddingBottom: spacing.lg }}
            >
              {bills.map((bill, index) => (
                <View key={index} style={styles.billItem}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.billName}>
                      {getBillName(bill, index)}
                    </Text>
                    <Text style={styles.billPeriod}>{getBillPeriod(bill)}</Text>
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={styles.billAmount}>
                      {formatCurrency(getBillAmount(bill))}
                    </Text>
                    <Text style={styles.billStatus}>{getBillStatus(bill)}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Tổng tiền cần thanh toán</Text>
            <Text style={styles.totalValue}>
              {formatCurrency(finalTotal || 0)}
            </Text>
          </View>
          <Text style={styles.note}>
            Đây là màn hình xác nhận tạm thời. Khi tích hợp VNPay thật, tổng
            tiền sẽ được gửi sang hệ thống thanh toán.
          </Text>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={handleBack}
          >
            <Text style={styles.secondaryButtonText}>Quay lại</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              styles.primaryButton,
              bills.length === 0 && styles.disabledButton,
            ]}
            disabled={bills.length === 0}
            onPress={handleOnlinePayment}
          >
            <Text style={styles.primaryButtonText}>Thanh toán online</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

/* ========== Helpers giống BillListScreen (rút gọn) ========== */

function getBillName(bill, index) {
  return (
    bill.name ??
    bill.bill_name ??
    bill.billName ??
    bill.title ??
    `Hóa đơn #${index + 1}`
  );
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
  const s = String(value).slice(0, 10);
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

/* ========== Styles ========== */

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
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: "#64748B",
    marginBottom: spacing.md,
  },
  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: 13,
    color: "#64748B",
  },
  billList: {
    maxHeight: 260,
  },
  billItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  billName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: 2,
  },
  billPeriod: {
    fontSize: 12,
    color: "#64748B",
  },
  billAmount: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
  },
  billStatus: {
    marginTop: 2,
    fontSize: 12,
    color: "#16A34A",
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
  note: {
    fontSize: 12,
    color: "#64748B",
  },
  footer: {
    marginTop: "auto",
    paddingBottom: spacing.lg,
    gap: 10,
  },
  button: {
    paddingVertical: 10,
    borderRadius: 999,
    alignItems: "center",
  },
  secondaryButton: {
    backgroundColor: "#E2E8F0",
  },
  secondaryButtonText: {
    color: "#0F172A",
    fontWeight: "600",
  },
  primaryButton: {
    backgroundColor: "#2563EB",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  disabledButton: {
    opacity: 0.5,
  },
});

export default OnlinePaymentScreen;
