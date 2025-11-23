// src/screens/bill/TransactionHistoryScreen.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import Header from "../../components/Header";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
import { getTenantPaymentHistory } from "../../service/api/payment";

function TransactionHistoryScreen() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchHistory = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getTenantPaymentHistory();
      const list = res?.data || [];
      setHistory(Array.isArray(list) ? list : []);
    } catch (err) {
      console.log("Error getTenantPaymentHistory:", err.message);
      setError(err.message || "Không thể tải lịch sử giao dịch.");
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const renderItem = ({ item }) => {
    const dateStr = item.payment_date
      ? new Date(item.payment_date).toLocaleString("vi-VN")
      : "Đang xử lý";

    const statusLabel =
      item.status === "completed"
        ? "Thành công"
        : item.status === "failed"
        ? "Thất bại"
        : item.status === "refunded"
        ? "Đã hoàn tiền"
        : item.status;

    const statusColor =
      item.status === "completed"
        ? colors.success
        : item.status === "failed"
        ? "#EF4444"
        : "#F97316";

    return (
      <View style={styles.itemContainer}>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={styles.itemTitle}>Thanh toán #{item.payment_id}</Text>
          <Text style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            {statusLabel}
          </Text>
        </View>

        <Text style={styles.itemText}>Ngày: {dateStr}</Text>
        <Text style={styles.itemText}>Số tiền: {item.amount} đ</Text>
        <Text style={styles.itemText}>Phương thức: {item.method}</Text>
        <Text style={styles.itemText}>
          Cổng online: {item.online_type || "N/A"}
        </Text>

        {item.bills && item.bills.length > 0 && (
          <View style={{ marginTop: 6 }}>
            <Text style={styles.itemSubTitle}>Hóa đơn liên quan:</Text>
            {item.bills.map((b) => (
              <Text key={b.bill_id} style={styles.billLine}>
                - #{b.bill_number || b.bill_id} (
                {b.description || "Không mô tả"})
              </Text>
            ))}
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <Header />
        <View style={[styles.content, styles.centerBox]}>
          <ActivityIndicator size="large" color={colors.brand} />
          <Text style={{ marginTop: 8 }}>Đang tải lịch sử giao dịch...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Header />

      <View style={styles.content}>
        <Text style={styles.title}>Lịch sử giao dịch</Text>

        {error ? (
          <View style={styles.centerBox}>
            <Text style={{ color: "red", textAlign: "center" }}>{error}</Text>
          </View>
        ) : (
          <FlatList
            data={history}
            renderItem={renderItem}
            keyExtractor={(item) => item.payment_id.toString()}
            contentContainerStyle={{ paddingBottom: spacing.lg }}
            ListEmptyComponent={
              <View style={styles.centerBox}>
                <Text>Chưa có giao dịch nào.</Text>
              </View>
            }
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0F172A" },
  content: {
    flex: 1,
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    marginBottom: spacing.md,
  },
  centerBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  itemContainer: {
    backgroundColor: colors.card,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  itemTitle: { fontSize: 15, fontWeight: "700", color: colors.text },
  itemText: { fontSize: 13, color: colors.muted, marginTop: 2 },
  itemSubTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text,
  },
  billLine: {
    fontSize: 12,
    color: colors.muted,
  },
  statusBadge: {
    fontSize: 11,
    color: "#FFFFFF",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    textTransform: "uppercase",
  },
});

export default TransactionHistoryScreen;
