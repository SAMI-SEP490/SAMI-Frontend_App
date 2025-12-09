import React, { useEffect } from "react";
import { View, Text, Pressable, StatusBar, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNotificationStore } from "../service/notificationStore";
import { useAuthStore } from "../auth";

export default function Header({ title, isHome = false, children }) {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  
  // GET LOGOUT FUNCTION FROM STORE
  const logout = useAuthStore((state) => state.logout);
  
  const unreadCount = useNotificationStore((state) => state.unreadCount);
  const fetchUnreadCount = useNotificationStore((state) => state.fetchUnreadCount);

  useEffect(() => {
    if (isHome) fetchUnreadCount();
  }, [isHome]);

  const onLogoutPress = () => {
    Alert.alert(
      "Đăng xuất",
      "Bạn có chắc chắn muốn đăng xuất không?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Đăng xuất",
          style: "destructive",
          onPress: async () => {
            // CALL STORE LOGOUT
            await logout(); 
          },
        },
      ]
    );
  };

  const goProfile = () => navigation.navigate("Profile");
  const goNotification = () => navigation.navigate("NotificationListScreen");
  const goBack = () => { if (navigation.canGoBack()) navigation.goBack(); };

  return (
    <View
      style={{
        backgroundColor: colors.brand,
        paddingTop: insets.top + spacing.sm,
        paddingBottom: isHome ? 80 : spacing.xl,
        paddingHorizontal: spacing.xl,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        zIndex: 1,
      }}
    >
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: children ? spacing.md : 0 }}>
        {/* Left */}
        <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
          {!isHome && navigation.canGoBack() && (
            <Pressable onPress={goBack} style={{ marginRight: spacing.md }}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </Pressable>
          )}
          <Text numberOfLines={1} style={{ color: "white", fontSize: 20, fontWeight: "800", flex: 1 }}>
            {title || "SAMI"}
          </Text>
        </View>

        {/* Right */}
        {isHome && (
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Pressable onPress={goNotification} style={{ marginRight: spacing.md }}>
              <Ionicons name="notifications-outline" size={24} color="#fff" />
              {unreadCount > 0 && (
                <View style={{ position: "absolute", top: -6, right: -4, backgroundColor: "#EF4444", borderRadius: 10, minWidth: 16, height: 16, alignItems: "center", justifyContent: "center", borderWidth: 1.5, borderColor: colors.brand }}>
                  <Text style={{ color: "white", fontSize: 9, fontWeight: "700" }}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
                </View>
              )}
            </Pressable>

            <Pressable onPress={goProfile} style={{ marginRight: spacing.md }}>
              <Ionicons name="person-circle-outline" size={28} color="#fff" />
            </Pressable>
            
            <Pressable onPress={onLogoutPress}>
              <Ionicons name="log-out-outline" size={24} color="#fff" />
            </Pressable>
          </View>
        )}
      </View>
      {children}
    </View>
  );
}
