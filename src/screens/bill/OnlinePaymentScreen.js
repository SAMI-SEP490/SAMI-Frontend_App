import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StatusBar
} from "react-native";
import * as WebBrowser from "expo-web-browser"; 
import { Ionicons } from "@expo/vector-icons";
import Header from "../../components/Header";
import { spacing } from "../../theme/spacing";
import { colors } from "../../theme/colors";
import { createPayOSPayment } from "../../service/api/payment";

// Currency helper
const VND = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
});

const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) return "0 đ";
  return VND.format(amount);
};

// Date helper
const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN");
};

function OnlinePaymentScreen({ navigation, route }) {
  const params = route?.params || {};
  const bills = params.bills || [];

  const [loading, setLoading] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState(null);
  const [error, setError] = useState("");

  const totalAmount = useMemo(
    () => bills.reduce((sum, b) => sum + (b.total_amount || 0), 0),
    [bills]
  );

  const handleCreatePayment = async () => {
    if (!bills.length) return;
    setLoading(true);
    setError("");
    try {
      const billIds = bills.map((b) => b.bill_id);
      const res = await createPayOSPayment(billIds);
      const data = res?.data;
      if (data?.checkoutUrl) {
        setCheckoutUrl(data.checkoutUrl);
      } else {
        setError("Không nhận được link thanh toán từ hệ thống.");
      }
    } catch (err) {
      setError(err.message || "Không thể tạo thanh toán.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenBrowser = async () => {
    if (!checkoutUrl) return;
    try {
      // FIX: createTask: false for Android compatibility
      await WebBrowser.openBrowserAsync(checkoutUrl, { createTask: false });
      
      Alert.alert(
        "Xác nhận giao dịch",
        "Bạn đã hoàn tất thanh toán chưa?",
        [
          { text: "Chưa", style: "cancel" },
          { text: "Rồi", onPress: () => navigation.replace("DashboardScreen") },
        ]
      );
    } catch (e) {
      Alert.alert("Lỗi", "Không thể mở trình duyệt.");
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <Header title="Xác nhận thanh toán" isHome={false} />

      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Chi tiết thanh toán</Text>
          {bills.map((b) => (
            <View key={b.bill_id} style={styles.billRow}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.billNumber} numberOfLines={1}>
                  Hóa đơn #{b.bill_number || b.bill_id}
                </Text>
                <Text style={styles.billPeriod}>
                  {formatDate(b.billing_period_start)} - {formatDate(b.billing_period_end)}
                </Text>
              </View>
              <Text style={styles.billAmount}>{formatCurrency(b.total_amount)}</Text>
            </View>
          ))}
          <View style={styles.divider} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Tổng cộng</Text>
            <Text style={styles.totalValue}>{formatCurrency(totalAmount)}</Text>
          </View>
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {!checkoutUrl && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleCreatePayment}
            disabled={loading || !bills.length}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.actionButtonText}>Tạo link thanh toán</Text>
            )}
          </TouchableOpacity>
        )}

        {checkoutUrl && (
          <View style={{ alignItems: 'center', marginTop: spacing.md }}>
            <View style={styles.successBox}>
                <Ionicons name="checkmark-circle" size={48} color={colors.success} />
                <Text style={styles.successTitle}>Link thanh toán đã sẵn sàng!</Text>
                <Text style={styles.successDesc}>Vui lòng nhấn nút bên dưới để thanh toán.</Text>
            </View>

            <TouchableOpacity
              style={[styles.actionButton, { marginTop: spacing.lg, backgroundColor: '#22C55E' }]}
              onPress={handleOpenBrowser}
            >
              <Text style={styles.actionButtonText}>Mở trang thanh toán</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.brand },
  contentContainer: {
    backgroundColor: "#F3F4F6",
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    paddingHorizontal: spacing.md,
    // FIX: Extra top padding
    paddingTop: spacing.xl + 24, 
    paddingBottom: 40,
    marginTop: -24,
    minHeight: "100%", 
  },
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    marginBottom: 20
  },
  cardTitle: { fontSize: 16, fontWeight: "700", color: "#111827", marginBottom: 16 },
  billRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 },
  billNumber: { fontSize: 14, fontWeight: "600", color: "#111827" },
  billPeriod: { fontSize: 12, color: "#6B7280", marginTop: 2 },
  billAmount: { fontSize: 14, fontWeight: "600", color: "#111827", textAlign: 'right' },
  divider: { height: 1, backgroundColor: "#E5E7EB", marginVertical: 12 },
  totalRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  totalLabel: { fontSize: 16, color: "#374151" },
  totalValue: { fontSize: 20, fontWeight: "800", color: colors.brand },
  errorText: { color: "#EF4444", textAlign: "center", marginBottom: 12 },
  actionButton: {
    backgroundColor: colors.brand,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    width: '100%',
    elevation: 2
  },
  actionButtonText: { color: "white", fontWeight: "700", fontSize: 16 },
  successBox: { alignItems: 'center', backgroundColor: 'white', padding: 20, borderRadius: 16, width: '100%', elevation: 2 },
  successTitle: { fontSize: 16, fontWeight: '700', color: "#111827", marginTop: 8 },
  successDesc: { textAlign: 'center', color: "#6B7280", marginTop: 4, fontSize: 13 },
});

export default OnlinePaymentScreen;
