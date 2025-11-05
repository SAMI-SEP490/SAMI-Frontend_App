import React, { useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import Header from "../../components/Header";
import { spacing } from "../../theme/spacing";
import { NotificationContext } from "../../contexts/NotificationContext";
import { useNavigation } from "@react-navigation/native";

export default function NotificationListScreen() {
  const { notificationData, setNotificationData } =
    useContext(NotificationContext);
  const navigation = useNavigation();

  /** Lấy icon phù hợp theo loại thông báo */
  const getIcon = (type) => {
    switch (type) {
      case "electricity":
        return { name: "bolt", color: "#FFB300" };
      case "water":
        return { name: "water-drop", color: "#2196F3" };
      case "maintenance":
        return { name: "build", color: "#FF5722" };
      case "meeting":
        return { name: "groups", color: "#4CAF50" };
      default:
        return { name: "info", color: "#9E9E9E" };
    }
  };

  /** Khi người dùng bấm vào 1 thông báo */
  const handlePress = (id) => {
    // Đánh dấu đã đọc
    const updated = notificationData.map((n) =>
      n.id === id ? { ...n, isRead: true } : n
    );
    setNotificationData(updated);

    // Điều hướng sang màn chi tiết
    navigation.navigate("NotificationDetailScreen", { id });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={{ paddingBottom: spacing.lg }}>
        <Header />
      </View>

      {/* Tiêu đề */}
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Thông báo tòa nhà</Text>
      </View>

      {/* Danh sách thông báo */}
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {notificationData.map((item) => {
          const { name, color } = getIcon(item.type);
          return (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.notificationItem,
                !item.isRead && styles.unreadItem,
              ]}
              onPress={() => handlePress(item.id)}
              activeOpacity={0.8}
            >
              <MaterialIcons
                name={name}
                size={26}
                color={color}
                style={styles.icon}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.titleText}>{item.title}</Text>
                <Text
                  style={styles.messageText}
                  numberOfLines={2}
                  ellipsizeMode="tail"
                >
                  {item.message}
                </Text>
                <Text style={styles.dateText}>{item.date}</Text>
              </View>
              {!item.isRead && <View style={styles.unreadDot} />}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  titleContainer: { alignItems: "center", marginBottom: 10 },
  title: { fontSize: 18, fontWeight: "bold", color: "#000" },
  scrollContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  notificationItem: {
    flexDirection: "row",
    backgroundColor: "#F8F8F8",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  unreadItem: {
    backgroundColor: "#E3F2FD",
  },
  icon: {
    marginRight: 10,
  },
  titleText: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#000",
  },
  messageText: {
    fontSize: 13,
    color: "#555",
    marginVertical: 2,
  },
  dateText: {
    fontSize: 12,
    color: "#888",
  },
  unreadDot: {
    width: 10,
    height: 10,
    backgroundColor: "#FF5252",
    borderRadius: 5,
    marginLeft: 6,
  },
});
