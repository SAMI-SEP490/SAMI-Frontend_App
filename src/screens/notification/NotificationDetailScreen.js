// src/screens/notification/NotificationDetailScreen.js

import React from "react";
import { View, Text, ScrollView } from "react-native";
import { useRoute } from "@react-navigation/native";

export default function NotificationDetailScreen() {
  const route = useRoute();
  const { notification } = route.params || {};

  if (!notification) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "white",
          alignItems: "center",
          justifyContent: "center",
          padding: 16,
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 8 }}>
          Không tìm thấy thông báo
        </Text>
        <Text style={{ color: "#6B7280", textAlign: "center" }}>
          Vui lòng quay lại danh sách thông báo và chọn lại.
        </Text>
      </View>
    );
  }

  const { title, body, createdAt, payload } = notification || {};
  const category = payload?.category || payload?.type || "Thông báo";
  const building = payload?.building || "Tất cả tòa nhà";
  const publishAt = payload?.publishAt || null;
  const contentDetail = payload?.content || body;

  const formatDate = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
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

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#F9FAFB" }}
      contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
    >
      <View
        style={{
          backgroundColor: "white",
          borderRadius: 12,
          padding: 16,
          shadowColor: "#000",
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 2,
        }}
      >
        <Text
          style={{
            fontSize: 18,
            fontWeight: "700",
            marginBottom: 8,
            color: "#111827",
          }}
        >
          {title}
        </Text>

        <Text style={{ fontSize: 13, color: "#6B7280", marginBottom: 4 }}>
          Loại: <Text style={{ fontWeight: "600" }}>{category}</Text>
        </Text>

        <Text style={{ fontSize: 13, color: "#6B7280", marginBottom: 4 }}>
          Tòa nhà: <Text style={{ fontWeight: "600" }}>{building}</Text>
        </Text>

        {publishAt ? (
          <Text style={{ fontSize: 13, color: "#6B7280", marginBottom: 4 }}>
            Thời gian hiển thị:{" "}
            <Text style={{ fontWeight: "600" }}>
              {formatDateTime(publishAt)}
            </Text>
          </Text>
        ) : null}

        <Text style={{ fontSize: 13, color: "#9CA3AF", marginBottom: 12 }}>
          Thời gian gửi: {formatDateTime(createdAt)}
        </Text>

        <View
          style={{
            height: 1,
            backgroundColor: "#E5E7EB",
            marginVertical: 8,
          }}
        />

        <Text
          style={{
            fontSize: 15,
            color: "#111827",
            lineHeight: 22,
          }}
        >
          {contentDetail}
        </Text>
      </View>
    </ScrollView>
  );
}
