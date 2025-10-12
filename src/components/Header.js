// src/components/Header.js
import React from "react";
import { View, Text, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";

export default function Header() {
  const navigation = useNavigation();

  // Vì 'Profile' khai báo ở RootNavigation, còn Header dùng trong màn thuộc Tab,
  // nên cần "leo" lên navigator cha (Root) rồi mới navigate.
  const goProfile = () => {
    const rootNav =
      navigation.getParent()?.getParent?.() || navigation.getParent();
    rootNav?.navigate("Profile");
  };

  return (
    <View
      style={{
        backgroundColor: colors.brand,
        paddingHorizontal: spacing.xl,
        paddingTop: spacing.lg,
        paddingBottom: spacing.xl,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: spacing.lg,
        }}
      >
        <Text
          style={{ color: "white", fontSize: 18, fontWeight: "800", flex: 1 }}
        >
          SAMI
        </Text>

        {/* Chuông + badge */}
        <View style={{ marginRight: spacing.md }}>
          <Ionicons name="notifications-outline" size={24} color="#fff" />
          <View
            style={{
              position: "absolute",
              top: -6,
              right: -6,
              backgroundColor: "#EF4444",
              borderRadius: 10,
              paddingHorizontal: 5,
              height: 18,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ color: "white", fontSize: 10, fontWeight: "700" }}>
              3
            </Text>
          </View>
        </View>

        {/* Icon người → bấm để mở Profile */}
        <Pressable onPress={goProfile} style={{ marginRight: spacing.md }}>
          <Ionicons name="person-circle-outline" size={26} color="#fff" />
        </Pressable>

        <Ionicons name="share-social-outline" size={22} color="#fff" />
      </View>
    </View>
  );
}
