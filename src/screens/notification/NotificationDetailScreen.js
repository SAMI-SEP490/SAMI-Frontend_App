// src/screens/NotificationDetailScreen.js
import React, { useContext, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, StatusBar } from "react-native";
import { useRoute } from "@react-navigation/native";
import Header from "../../components/Header";
import { spacing } from "../../theme/spacing";
import { NotificationContext } from "../../contexts/NotificationContext";

export default function NotificationDetailScreen() {
  const route = useRoute();
  const { id } = route.params || {};
  const { notificationData, setNotificationData } =
    useContext(NotificationContext);

  // Tìm thông báo theo ID
  const notification = notificationData.find((item) => item.id === id);

  // Khi mở màn hình, nếu thông báo tồn tại và chưa đọc thì đánh dấu đã đọc
  useEffect(() => {
    if (!notification || notification.isRead) return;
    const updated = notificationData.map((n) =>
      n.id === id ? { ...n, isRead: true } : n
    );
    setNotificationData(updated);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!notification) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.errorText}>Không tìm thấy thông báo.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header giống App */}
      <View style={{ paddingBottom: spacing.lg }}>
        <Header />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>{notification.title}</Text>

        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Mã:</Text>
          <Text style={styles.metaValue}>{notification.id}</Text>
        </View>

        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Người gửi:</Text>
          <Text style={styles.metaValue}>{notification.sender}</Text>
        </View>

        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Ngày:</Text>
          <Text style={styles.metaValue}>{notification.date}</Text>
        </View>

        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Loại:</Text>
          <Text style={styles.metaValue}>{notification.type}</Text>
        </View>

        <View style={styles.separator} />

        <Text style={styles.message}>{notification.message}</Text>

        <View style={styles.separator} />

        <Text style={styles.note}>
          Nếu cần hỗ trợ thêm, vui lòng liên hệ Ban Quản Lý Tòa Nhà.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { color: "red", fontSize: 16 },
  content: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#004AAD",
    marginBottom: 12,
  },
  metaRow: { flexDirection: "row", marginBottom: 6 },
  metaLabel: { width: 90, color: "#555", fontWeight: "600" },
  metaValue: { color: "#333", flex: 1 },
  separator: { height: 1, backgroundColor: "#e0e0e0", marginVertical: 12 },
  message: {
    fontSize: 15,
    color: "#222",
    lineHeight: 22,
    textAlign: "justify",
  },
  note: { fontSize: 13, color: "#666", marginTop: 12, fontStyle: "italic" },
});
