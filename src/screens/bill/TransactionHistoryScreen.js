// src/screens/bill/TransactionHistoryScreen.js
import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import Header from "../../components/Header";
import { spacing } from "../../theme/spacing";
import { getTenantPaymentHistory } from "../../service/api/payment";

function TransactionHistoryScreen() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadHistory() {
      setLoading(true);
      setError("");
      try {
        const data = await getTenantPaymentHistory();

        let list = [];
        if (Array.isArray(data)) {
          list = data;
        } else if (Array.isArray(data?.items)) {
          list = data.items;
        } else if (Array.isArray(data?.data)) {
          list = data.data;
        }

        if (!cancelled) {
          setTransactions(list);
        }
      } catch (e) {
        if (!cancelled) {
          const msg =
            e?.response?.data?.message ||
            e?.message ||
            "Không tải được lịch sử giao dịch";
          setError(msg);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadHistory();
    return () => {
      cancelled = true;
    };
  }, []);

  const totalPaid = useMemo(
    () =>
      transactions.reduce((sum, t) => {
        const v = getTransactionAmount(t);
        return sum + (Number.isFinite(v) ? v : 0);
      }, 0),
    [transactions]
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Header />

      <View style={styles.content}>
        <Text style={styles.title}>Lịch sử giao dịch</Text>
        <Text style={styles.subtitle}>
          Danh sách các lần thanh toán hoá đơn của bạn.
        </Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {loading && (
          <View style={styles.centerBox}>
            <ActivityIndicator size="small" />
            <Text style={{ marginTop: 8 }}>Đang tải dữ liệu...</Text>
          </View>
        )}

        {!loading && !transactions.length && !error && (
          <View style={styles.centerBox}>
            <Text>Hiện chưa có giao dịch nào được ghi nhận.</Text>
          </View>
        )}

        {!loading && !!transactions.length && (
          <View style={styles.card}>
            <ScrollView
              style={{ maxHeight: 420 }}
              contentContainerStyle={{ paddingBottom: spacing.lg }}
            >
              {transactions.map((t, index) => (
                <View key={getTransactionKey(t, index)} style={styles.item}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemTitle}>
                      {getTransactionTitle(t, index)}
                    </Text>
                    <Text style={styles.itemTime}>{getTransactionTime(t)}</Text>
                    <Text style={styles.itemNote}>{getTransactionNote(t)}</Text>
                  </View>

                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={styles.itemAmount}>
                      {formatCurrency(getTransactionAmount(t))}
                    </Text>
                    <Text
                      style={[
                        styles.itemStatus,
                        getStatusStyle(getTransactionStatus(t)),
                      ]}
                    >
                      {getTransactionStatus(t)}
                    </Text>
                  </View>
                </View>
              ))}
            </ScrollView>

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Tổng tiền đã thanh toán</Text>
              <Text style={styles.totalValue}>{formatCurrency(totalPaid)}</Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

/* =============== Helpers =============== */

function getTransactionKey(t, index) {
  return String(t.id ?? t.payment_id ?? t.paymentId ?? `txn-${index}`);
}

function getTransactionTitle(t, index) {
  // tuỳ backend, đoán một số field thường gặp
  return (
    t.title ??
    t.description ??
    t.bill_title ??
    t.billDescription ??
    `Giao dịch #${index + 1}`
  );
}

function getTransactionTime(t) {
  const raw =
    t.created_at ??
    t.createdAt ??
    t.payment_time ??
    t.time ??
    t.timestamp ??
    null;
  if (!raw) return "—";

  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return String(raw);
  return (
    d.toLocaleDateString("vi-VN") +
    " " +
    d.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    })
  );
}

function getTransactionNote(t) {
  // nếu backend có list bill code / method thì hiển thị thêm
  const method = t.method ?? t.payment_method ?? t.channel ?? "";
  const bills = t.bill_codes ?? t.billNumbers ?? t.bills ?? null;

  let note = "";
  if (method) note += `Phương thức: ${method}`;
  if (bills) {
    const txt = Array.isArray(bills) ? bills.join(", ") : String(bills);
    note += (note ? " · " : "") + `Hoá đơn: ${txt}`;
  }
  return note || "";
}

function getTransactionStatus(t) {
  const raw = t.status ?? t.payment_status ?? t.state ?? "";
  const s = String(raw || "").toLowerCase();
  if (!s) return "Không rõ";

  if (["success", "completed", "paid"].includes(s)) return "Thành công";
  if (["pending", "processing"].includes(s)) return "Đang xử lý";
  if (["failed", "cancelled", "error"].includes(s)) return "Thất bại";
  return raw;
}

function getTransactionAmount(t) {
  const candidates = [
    t.amount,
    t.total_amount,
    t.paid_amount,
    t.transaction_amount,
  ];
  for (const v of candidates) {
    const n = Number(v);
    if (Number.isFinite(n)) return n;
  }
  return 0;
}

function getStatusStyle(label) {
  const s = String(label || "").toLowerCase();
  if (s.includes("thành công")) {
    return { color: "#059669" };
  }
  if (s.includes("đang")) {
    return { color: "#D97706" };
  }
  if (s.includes("thất bại") || s.includes("hủy")) {
    return { color: "#DC2626" };
  }
  return { color: "#64748B" };
}

function formatCurrency(v) {
  const n = Number(v);
  if (!Number.isFinite(n) || n <= 0) return "0 đ";
  try {
    return n.toLocaleString("vi-VN") + " đ";
  } catch {
    return `${n} đ`;
  }
}

/* =============== Styles =============== */

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
  error: {
    color: "#DC2626",
    marginBottom: spacing.sm,
  },
  centerBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.lg,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: spacing.md,
  },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: 2,
  },
  itemTime: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 2,
  },
  itemNote: {
    fontSize: 12,
    color: "#94A3B8",
  },
  itemAmount: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
  },
  itemStatus: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: "600",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.md,
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
});

export default TransactionHistoryScreen;
