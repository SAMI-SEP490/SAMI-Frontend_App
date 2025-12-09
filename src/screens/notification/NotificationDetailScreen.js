import React from "react";
import { View, Text, ScrollView, StyleSheet, StatusBar } from "react-native";
import { useRoute } from "@react-navigation/native";
import Header from "../../components/Header";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";

export default function NotificationDetailScreen() {
  const route = useRoute();
  const { notification } = route.params || {};

  if (!notification) {
    return (
      <View style={styles.container}>
        <Header title="Chi tiết" isHome={false} />
        <View style={styles.centerBox}>
          <Text style={{ color: "#6B7280" }}>Không tìm thấy thông báo.</Text>
        </View>
      </View>
    );
  }

  const { title, body, createdAt, payload } = notification;
  const category = payload?.category || "Thông báo";
  const building = payload?.building || "Tất cả tòa nhà";
  const publishAt = payload?.publishAt;
  const contentDetail = payload?.content || body;

  const formatDate = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleString("vi-VN");
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <Header title="Chi tiết thông báo" isHome={false} />

      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.card}>
          {/* Tag */}
          <View style={styles.tagContainer}>
            <Text style={styles.tagText}>{String(category).toUpperCase()}</Text>
          </View>

          <Text style={styles.title}>{title}</Text>

          {/* Meta Info */}
          <View style={styles.metaBox}>
             <View style={styles.row}>
                <Text style={styles.label}>Tòa nhà:</Text>
                <Text style={styles.value}>{building}</Text>
             </View>
             
             <View style={styles.row}>
                <Text style={styles.label}>Thời gian gửi:</Text>
                <Text style={styles.value}>{formatDate(createdAt)}</Text>
             </View>

             {publishAt && (
                <View style={styles.row}>
                    <Text style={styles.label}>Hiệu lực từ:</Text>
                    <Text style={styles.value}>{formatDate(publishAt)}</Text>
                </View>
             )}
          </View>

          <View style={styles.divider} />

          <Text style={styles.content}>{contentDetail}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.brand,
  },
  contentContainer: {
    backgroundColor: "#F3F4F6", // Gray Sheet
    marginTop: -24, // Overlap
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xl + 24, 
    paddingBottom: 40,
    minHeight: "100%"
  },
  centerBox: {
      flex: 1,
      backgroundColor: "#F3F4F6",
      marginTop: -24,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      justifyContent: 'center',
      alignItems: 'center'
  },
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  tagContainer: {
      backgroundColor: "#EFF6FF",
      alignSelf: 'flex-start',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 8,
      marginBottom: 12
  },
  tagText: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.brand
  },
  title: {
      fontSize: 20,
      fontWeight: '700',
      color: '#111827',
      marginBottom: 16,
      lineHeight: 28
  },
  metaBox: {
      backgroundColor: '#F9FAFB',
      padding: 12,
      borderRadius: 12
  },
  row: {
      flexDirection: 'row',
      marginBottom: 6
  },
  label: {
      fontSize: 13,
      color: '#6B7280',
      width: 100
  },
  value: {
      fontSize: 13,
      fontWeight: '600',
      color: '#374151',
      flex: 1
  },
  divider: {
      height: 1,
      backgroundColor: '#E5E7EB',
      marginVertical: 20
  },
  content: {
      fontSize: 15,
      color: '#374151',
      lineHeight: 24
  }
});
