import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  StatusBar
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";

import Header from "../../components/Header";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
import { useNotificationStore } from "../../service/notificationStore"; // New path

import {
  getMyNotifications,
  markNotificationRead,
  markAllNotificationsRead, // Import new API
} from "../../service/api/notification";

export default function NotificationListScreen() {
  const navigation = useNavigation();
  const { fetchUnreadCount, decreaseCount, markAllAsReadLocal } = useNotificationStore();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = async () => {
    try {
      if (!refreshing) setLoading(true);
      const list = await getMyNotifications();

      const now = new Date();
      const mapped = (list || [])
        .map((item) => ({
          id: item.user_notification_id,
          isRead: item.is_read,
          readAt: item.read_at,
          createdAt: item.notification?.created_at,
          title: item.notification?.title || "",
          body: item.notification?.body || "",
          payload: item.notification?.payload || {},
        }))
        // Filter future notifications
        .filter((item) => {
          const publishAt = item.payload?.publishAt;
          if (!publishAt) return true;
          const t = new Date(publishAt);
          if (Number.isNaN(t.getTime())) return true;
          return t <= now;
        })
        .sort((a, b) => {
          // Sort unread first, then by date
          if (a.isRead === b.isRead) {
             const t1 = a.createdAt ? new Date(a.createdAt).getTime() : 0;
             const t2 = b.createdAt ? new Date(b.createdAt).getTime() : 0;
             return t2 - t1;
          }
          return a.isRead ? 1 : -1;
        });

      setNotifications(mapped);
      
      // Sync global badge
      fetchUnreadCount(); 

    } catch (error) {
      console.log("fetchNotifications error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchNotifications();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const handleMarkAllRead = async () => {
    try {
      // 1. Optimistic UI update
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      markAllAsReadLocal(); // Clear global badge

      // 2. Call API
      await markAllNotificationsRead();
    } catch (error) {
      console.log("Mark all read error:", error);
      fetchNotifications(); // Revert on error
    }
  };

  const handlePressItem = async (item) => {
    // Navigate immediately
    navigation.navigate("NotificationDetailScreen", { notification: item });

    // Mark read if needed
    if (!item.isRead) {
      try {
        // UI Update
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === item.id ? { ...n, isRead: true } : n
          )
        );
        decreaseCount(); // Update global badge
        await markNotificationRead(item.id);
      } catch (error) {
        console.log("Mark read error:", error);
      }
    }
  };

  const getIcon = (payload) => {
    const category = payload?.category || payload?.type || "";
    switch (category) {
      case "maintenance":
      case "Bảo trì":
        return { name: "build", color: "#F97316", bg: "#FFEDD5" }; // Orange
      case "regulation":
      case "Quy định":
        return { name: "assignment", color: colors.brand, bg: "#E0F2FE" }; // Blue
      case "payment":
      case "Hóa đơn":
        return { name: "attach-money", color: "#16A34A", bg: "#DCFCE7" }; // Green
      default:
        return { name: "notifications", color: "#6B7280", bg: "#F3F4F6" }; // Gray
    }
  };

  const formatDateTime = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    return `${d.getDate()}/${d.getMonth() + 1} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  const renderItem = ({ item }) => {
    const icon = getIcon(item.payload);
    return (
      <TouchableOpacity
        onPress={() => handlePressItem(item)}
        style={[styles.card, !item.isRead && styles.unreadCard]}
        activeOpacity={0.7}
      >
        <View style={[styles.iconBox, { backgroundColor: icon.bg }]}>
          <MaterialIcons name={icon.name} size={22} color={icon.color} />
        </View>

        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
            <Text style={[styles.title, !item.isRead && styles.unreadText]} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={styles.date}>{formatDateTime(item.createdAt)}</Text>
          </View>
          
          <Text style={styles.body} numberOfLines={2}>
            {item.body}
          </Text>
        </View>

        {!item.isRead && <View style={styles.dot} />}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <Header title="Thông báo" isHome={false} />

      <View style={styles.contentContainer}>
        {/* Top Action Row */}
        <View style={styles.topRow}>
            <Text style={styles.subtitle}>Danh sách</Text>
            <TouchableOpacity onPress={handleMarkAllRead} style={styles.markReadBtn}>
                <Ionicons name="checkmark-done-outline" size={18} color={colors.brand} />
                <Text style={styles.markReadText}>Đọc tất cả</Text>
            </TouchableOpacity>
        </View>

        {loading && !refreshing ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
             <ActivityIndicator size="large" color={colors.brand} />
          </View>
        ) : (
          <FlatList
            data={notifications}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 40 }}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.brand]} />
            }
            ListEmptyComponent={
              <View style={{ alignItems: "center", marginTop: 60 }}>
                <MaterialIcons name="notifications-none" size={48} color="#D1D5DB" />
                <Text style={{ color: "#6B7280", marginTop: 10 }}>Không có thông báo nào.</Text>
              </View>
            }
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.brand, // Blue Background
  },
  contentContainer: {
    flex: 1,
    backgroundColor: "#F3F4F6", // Gray Sheet
    marginTop: -24, // Overlap Header
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xl + 24, // Clear header
  },
  topRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12
  },
  subtitle: {
      fontSize: 16,
      fontWeight: '700',
      color: '#374151'
  },
  markReadBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'white',
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: '#E5E7EB'
  },
  markReadText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.brand,
      marginLeft: 4
  },
  card: {
    flexDirection: "row",
    backgroundColor: "white",
    padding: 16,
    borderRadius: 16,
    marginBottom: 10,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  unreadCard: {
    backgroundColor: "white",
    borderLeftWidth: 4,
    borderLeftColor: colors.brand
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
    flex: 1
  },
  unreadText: {
    fontWeight: "800",
    color: "#111827",
  },
  date: {
    fontSize: 11,
    color: "#9CA3AF",
    marginLeft: 8
  },
  body: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 18
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.brand,
    marginLeft: 8
  }
});
