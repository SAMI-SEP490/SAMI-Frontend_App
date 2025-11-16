// src/screens/bill/VnpayWebViewScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { WebView } from "react-native-webview";
import Header from "../../components/Header";
import { spacing } from "../../theme/spacing";

const VNPAY_SANDBOX_URL = "https://sandbox.vnpayment.vn/apis/vnpay-demo/";

function VnpayWebViewScreen({ navigation, route }) {
  const params = route?.params || {};
  const totalAmount = Number(params.totalAmount ?? 0);

  const [loading, setLoading] = useState(true);

  const handleDone = () => {
    // Hiện tại chỉ demo -> quay lại màn danh sách hóa đơn
    navigation.navigate("BillListScreen");
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Header />

      <View style={styles.content}>
        <Text style={styles.title}>Thanh toán qua VNPay (sandbox)</Text>
        <Text style={styles.subtitle}>
          Đây là màn hình demo VNPay sandbox. Thao tác tại đây chưa gắn với hệ
          thống thanh toán thật.
        </Text>

        <View style={styles.amountBox}>
          <Text style={styles.amountLabel}>Số tiền cần thanh toán</Text>
          <Text style={styles.amountValue}>
            {formatCurrency(totalAmount || 0)}
          </Text>
        </View>

        <View style={styles.webviewWrapper}>
          {loading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="small" />
              <Text style={styles.loadingText}>Đang tải VNPay...</Text>
            </View>
          )}

          <WebView
            source={{ uri: VNPAY_SANDBOX_URL }}
            onLoadStart={() => setLoading(true)}
            onLoadEnd={() => setLoading(false)}
          />
        </View>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.doneButton} onPress={handleDone}>
            <Text style={styles.doneButtonText}>
              Hoàn tất thanh toán (demo)
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

function formatCurrency(v) {
  const n = Number(v);
  if (!Number.isFinite(n) || n <= 0) return "—";
  try {
    return n.toLocaleString("vi-VN") + " đ";
  } catch {
    return `${n} đ`;
  }
}

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
    paddingBottom: spacing.lg,
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
  amountBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  amountLabel: {
    fontSize: 13,
    color: "#64748B",
    marginBottom: 4,
  },
  amountValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
  },
  webviewWrapper: {
    flex: 1,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: spacing.md,
  },
  loadingOverlay: {
    position: "absolute",
    zIndex: 10,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(248, 250, 252, 0.8)",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 6,
    fontSize: 12,
    color: "#475569",
  },
  footer: {
    alignItems: "center",
  },
  doneButton: {
    backgroundColor: "#22C55E",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 999,
  },
  doneButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
});

export default VnpayWebViewScreen;
