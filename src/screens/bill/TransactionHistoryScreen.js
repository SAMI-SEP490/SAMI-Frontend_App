import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  StatusBar
} from "react-native";
import Header from "../../components/Header";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
import { getTenantPaymentHistory } from "../../service/api/payment";

// Status Config
const STATUS_CONFIG = {
  completed: { label: "Thành công", color: "#16A34A", bg: "#DCFCE7" },
  failed: { label: "Thất bại", color: "#EF4444", bg: "#FEE2E2" },
  refunded: { label: "Hoàn tiền", color: "#F97316", bg: "#FFEDD5" },
  pending: { label: "Đang xử lý", color: "#D97706", bg: "#FEF3C7" }
};

// Currency helper
const VND = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
});

const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) return "0 đ";
  return VND.format(amount);
};

function TransactionHistoryScreen() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await getTenantPaymentHistory();
        const list = res?.data || [];
        // Sort newest first
        list.sort((a, b) => new Date(b.payment_date) - new Date(a.payment_date));
        setHistory(list);
      } catch (err) {
        setError("Không thể tải lịch sử giao dịch.");
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const renderItem = ({ item }) => {
    const dateStr = item.payment_date
      ? new Date(item.payment_date).toLocaleString("vi-VN")
      : "Đang xử lý";

    const statusStyle = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.itemTitle}>GD #{item.payment_id}</Text>
            <Text style={styles.itemDate}>{dateStr}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: statusStyle.bg }]}>
             <Text style={[styles.badgeText, { color: statusStyle.color }]}>{statusStyle.label}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Số tiền:</Text>
            <Text style={styles.amountText}>{formatCurrency(item.amount)}</Text>
        </View>
        
        <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Phương thức:</Text>
            <Text style={styles.infoValue}>
                {item.method} {item.online_type ? `(${item.online_type})` : ''}
            </Text>
        </View>

        {item.bills && item.bills.length > 0 && (
          <View style={styles.billSection}>
            <Text style={styles.sectionHeader}>Hóa đơn liên quan:</Text>
            {item.bills.map((b) => (
              <Text key={b.bill_id} style={styles.billLine}>
                • #{b.bill_number || b.bill_id}
              </Text>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <Header title="Lịch sử giao dịch" isHome={false} />

      <View style={styles.contentContainer}>
        {loading && (
             <ActivityIndicator size="large" color={colors.brand} style={{marginTop: 40}} />
        )}

        {!loading && error ? (
            <Text style={{ color: "red", textAlign: "center", marginTop: 40 }}>{error}</Text>
        ) : null}

        {!loading && !error && (
            <FlatList
                data={history}
                renderItem={renderItem}
                keyExtractor={(item) => item.payment_id.toString()}
                contentContainerStyle={{ paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                <View style={{ alignItems: 'center', marginTop: 40 }}>
                    <Text style={{color: colors.muted}}>Chưa có giao dịch nào.</Text>
                </View>
                }
            />
        )}
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
    // FIX: Extra top padding
    paddingTop: spacing.xl + 24, 
  },
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  itemTitle: { fontSize: 16, fontWeight: "700", color: "#111827" },
  itemDate: { fontSize: 12, color: "#6B7280", marginTop: 2 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontSize: 11, fontWeight: "700", textTransform: "uppercase" },
  divider: { height: 1, backgroundColor: "#F3F4F6", marginVertical: 12 },
  infoRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  infoLabel: { fontSize: 13, color: "#6B7280" },
  infoValue: { fontSize: 13, color: "#111827", fontWeight: "500" },
  amountText: { fontSize: 15, fontWeight: "700", color: colors.brand },
  billSection: { marginTop: 8, backgroundColor: "#F9FAFB", padding: 8, borderRadius: 8 },
  sectionHeader: { fontSize: 12, fontWeight: "600", color: "#374151", marginBottom: 4 },
  billLine: { fontSize: 12, color: "#6B7280" },
});

export default TransactionHistoryScreen;
