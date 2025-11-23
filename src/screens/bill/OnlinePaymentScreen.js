// src/screens/bill/OnlinePaymentScreen.js
import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import Header from "../../components/Header";
import { spacing } from "../../theme/spacing";
import { colors } from "../../theme/colors";
import { createPayOSPayment } from "../../service/api/payment";
import QRCode from "react-native-qrcode-svg";

function OnlinePaymentScreen({ navigation, route }) {
  const params = route?.params || {};
  const bills = params.bills || [];

  const [loading, setLoading] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState(null);
  const [error, setError] = useState("");

  const totalAmount = useMemo(
    () =>
      bills.reduce((sum, b) => {
        return sum + (b.total_amount || 0);
      }, 0),
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
      console.log("Error create PayOS payment:", err.message);
      setError(err.message || "Không thể tạo thanh toán.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenWebView = () => {
    if (!checkoutUrl) return;
    navigation.navigate("VnpayWebViewScreen", {
      paymentUrl: checkoutUrl,
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Header />

      <View style={styles.content}>
        <Text style={styles.title}>Xác nhận thanh toán</Text>
        <Text style={styles.subtitle}>
          Bạn đang thanh toán cho {bills.length} hóa đơn
        </Text>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingTop: spacing.md }}
        >
          {bills.map((b) => (
            <View key={b.bill_id} style={styles.billCard}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginBottom: 4,
                }}
              >
                <Text style={styles.billTitle}>
                  Hóa đơn #{b.bill_number || b.bill_id}
                </Text>
                <Text style={styles.billStatus}>{b.status}</Text>
              </View>
              <Text style={styles.billText}>
                Kỳ: {b.billing_period_start} - {b.billing_period_end}
              </Text>
              <Text style={styles.billText}>
                Số tiền: {b.total_amount || 0} đ
              </Text>
            </View>
          ))}

          <View style={styles.summaryBox}>
            <Text style={styles.summaryLabel}>Tổng cần thanh toán</Text>
            <Text style={styles.summaryValue}>{totalAmount} đ</Text>
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {!checkoutUrl && (
            <TouchableOpacity
              style={styles.createButton}
              onPress={handleCreatePayment}
              disabled={loading || !bills.length}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.createButtonText}>
                  Tạo thanh toán PayOS
                </Text>
              )}
            </TouchableOpacity>
          )}

          {checkoutUrl && (
            <>
              <Text style={styles.sectionTitle}>Thanh toán bằng QR</Text>
              <View style={styles.qrWrapper}>
                <View style={styles.qrBox}>
                  <QRCode value={checkoutUrl} size={220} />
                </View>
              </View>

              <Text style={styles.qrHint}>
                Mở ứng dụng ngân hàng và quét mã QR để thanh toán.
              </Text>

              <TouchableOpacity
                style={styles.webButton}
                onPress={handleOpenWebView}
              >
                <Text style={styles.webButtonText}>
                  Thanh toán bằng WebView
                </Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F172A",
  },
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
  },
  subtitle: {
    fontSize: 13,
    color: colors.muted,
    marginTop: 4,
  },
  billCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  billTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
  },
  billStatus: {
    fontSize: 11,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#E5E7EB",
    textTransform: "uppercase",
    color: "#111827",
  },
  billText: {
    fontSize: 13,
    color: colors.muted,
    marginTop: 2,
  },
  summaryBox: {
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.muted,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
  },
  errorText: {
    marginTop: spacing.sm,
    color: "red",
    textAlign: "center",
  },
  createButton: {
    marginTop: spacing.md,
    backgroundColor: colors.brand,
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: "center",
  },
  createButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
  },
  sectionTitle: {
    marginTop: spacing.lg,
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
  },
  qrWrapper: {
    marginTop: spacing.md,
    alignItems: "center",
  },
  qrBox: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 16,
    elevation: 4,
  },
  qrHint: {
    marginTop: spacing.sm,
    fontSize: 12,
    textAlign: "center",
    color: colors.muted,
  },
  webButton: {
    marginTop: spacing.lg,
    backgroundColor: "#22C55E",
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: "center",
  },
  webButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
  },
});

export default OnlinePaymentScreen;
