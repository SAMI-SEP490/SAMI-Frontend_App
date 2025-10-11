import React from "react";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import {
  SafeAreaView,
  StatusBar,
  View,
  Text,
  FlatList,
  Pressable,
} from "react-native";
import {
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
function Header() {
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

        <Ionicons
          name="person-circle-outline"
          size={26}
          color="#fff"
          style={{ marginRight: spacing.md }}
        />
        <Ionicons name="share-social-outline" size={22} color="#fff" />
      </View>
    </View>
  );
}

export default Header;
