// src/screens/notification/NotificationListScreen.js

import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";

import {
  getMyNotifications,
  markNotificationRead,
} from "../../service/api/notification";

export default function NotificationListScreen() {
  const navigation = useNavigation();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const list = await getMyNotifications();

      // Backend trả dạng:
      // [
      //   {
      //     user_notification_id,
      //     is_read,
      //     read_at,
      //     notification: {
      //       notification_id,
      //       title,
      //       body,
      //       payload,
      //       created_at
      //     }
      //   }, ...
      // ]

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
        // chỉ hiện thông báo đã tới giờ publish
        .filter((item) => {
          const publishAt = item.payload?.publishAt;
          if (!publishAt) return true; // không chọn → hiện luôn
          const t = new Date(publishAt);
          if (Number.isNaN(t.getTime())) return true;
          return t <= now;
        })
        // sort mới nhất lên trên
        .sort((a, b) => {
          const t1 = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const t2 = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return t2 - t1;
        });

      setNotifications(mapped);
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

  const getIcon = (payload) => {
    const category = payload?.category || payload?.type || "";

    switch (category) {
      case "Bảo trì":
      case "maintenance":
        return { name: "build", color: "#FF5722" };
      case "Quy định":
      case "regulation":
        return { name: "rule", color: "#3B82F6" };
      case "Thông báo chung":
      case "info":
      default:
        return { name: "notifications", color: "#9E9E9E" };
    }
  };

  const formatDateTime = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    const hh = String(d.getHours()).padStart(2, "0");
    const mi = String(d.getMinutes()).padStart(2, "0");
    return `${dd}/${mm}/${yyyy} ${hh}:${mi}`;
  };

  const handlePressItem = async (item) => {
    try {
      if (!item.isRead) {
        await markNotificationRead(item.id);
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === item.id
              ? { ...n, isRead: true, readAt: new Date().toISOString() }
              : n
          )
        );
      }

      navigation.navigate("NotificationDetailScreen", {
        notification: item,
      });
    } catch (error) {
      console.log("markNotificationRead error:", error);
      // lỗi vẫn cho vào màn chi tiết
      navigation.navigate("NotificationDetailScreen", {
        notification: item,
      });
    }
  };

  const renderItem = ({ item }) => {
    const icon = getIcon(item.payload);
    return (
      <Pressable
        onPress={() => handlePressItem(item)}
        style={{
          flexDirection: "row",
          paddingVertical: 12,
          paddingHorizontal: 16,
          borderBottomWidth: 1,
          borderBottomColor: "#E5E7EB",
          backgroundColor: item.isRead ? "#F9FAFB" : "#EEF2FF",
        }}
      >
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            alignItems: "center",
            justifyContent: "center",
            marginRight: 12,
            backgroundColor: "#E5E7EB",
          }}
        >
          <MaterialIcons name={icon.name} size={22} color={icon.color} />
        </View>

        <View style={{ flex: 1 }}>
          <Text
            numberOfLines={1}
            style={{
              fontSize: 15,
              fontWeight: item.isRead ? "500" : "700",
              color: "#111827",
            }}
          >
            {item.title}
          </Text>
          <Text
            numberOfLines={2}
            style={{
              fontSize: 13,
              color: "#4B5563",
              marginTop: 2,
            }}
          >
            {item.body}
          </Text>
          <Text
            style={{
              fontSize: 11,
              color: "#9CA3AF",
              marginTop: 4,
            }}
          >
            {formatDateTime(item.createdAt)}
          </Text>
        </View>

        {!item.isRead && (
          <View
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: "#2563EB",
              marginLeft: 8,
              marginTop: 4,
            }}
          />
        )}
      </Pressable>
    );
  };

  if (loading && !refreshing) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "white",
        }}
      >
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 8, color: "#6B7280" }}>
          Đang tải thông báo...
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <FlatList
        data={notifications}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View
            style={{
              padding: 16,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#6B7280" }}>
              Hiện chưa có thông báo nào.
            </Text>
          </View>
        }
      />
    </View>
  );
}
