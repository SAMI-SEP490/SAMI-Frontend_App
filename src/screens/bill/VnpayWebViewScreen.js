// src/screens/bill/VnpayWebViewScreen.js
import React, { useState } from "react";
import { View, StyleSheet, ActivityIndicator, StatusBar } from "react-native";
import { WebView } from "react-native-webview";
import Header from "../../components/Header";
import { spacing } from "../../theme/spacing";
import { colors } from "../../theme/colors";

function VnpayWebViewScreen({ route, navigation }) {
  const { paymentUrl } = route.params;
  const [loading, setLoading] = useState(true);

  const handleNavChange = (navState) => {
    const url = navState.url || "";

    if (url.includes("/payments/success")) {
      // thanh toán thành công
      navigation.replace("TransactionHistoryScreen");
    }

    if (url.includes("/payments/cancel")) {
      // thanh toán bị hủy / thất bại
      navigation.replace("TransactionHistoryScreen");
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Header />

      <View style={styles.content}>
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={colors.brand} />
          </View>
        )}

        <WebView
          source={{ uri: paymentUrl }}
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
          onNavigationStateChange={handleNavChange}
        />
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
    overflow: "hidden",
  },
  loadingOverlay: {
    position: "absolute",
    top: "45%",
    left: 0,
    right: 0,
    zIndex: 10,
    alignItems: "center",
  },
});

export default VnpayWebViewScreen;
