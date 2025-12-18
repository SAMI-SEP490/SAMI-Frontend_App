import React from "react";
import { View, Text, FlatList, Pressable } from "react-native";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
import {
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import Header from "../../components/Header";

const FEATURES = [
  {
    key: "bill",
    label: "Thanh toán hóa đơn",
    icon: (p) => <Ionicons name="card-outline" size={26} color={p} />,
    bg: "#E9F1FF",
  },
  {
    key: "vehicle",
    label: "Đăng ký gửi xe",
    icon: (p) => <Ionicons name="car-outline" size={26} color={p} />,
    bg: "#E9FBE7",
  },
  {
    key: "residence",
    label: "Đăng ký tạm trú",
    icon: (p) => <Ionicons name="people-outline" size={26} color={p} />,
    bg: "#F9EEFF",
  },
  {
    key: "map",
    label: "Xem sơ đồ tòa nhà",
    icon: (p) => <Ionicons name="map-outline" size={26} color={p} />,
    bg: "#FFF3E7",
  },
  {
    key: "rules",
    label: "Nội quy tòa nhà",
    icon: (p) => <Ionicons name="book-outline" size={26} color={p} />,
    bg: "#F0F7FF",
  },
  {
    key: "maintenance",
    label: "Bảo trì",
    icon: (p) => <MaterialIcons name="build" size={26} color={p} />,
    bg: "#FFF5F0",
  },
  {
    key: "contract",
    label: "Xem hợp đồng",
    icon: (p) => (
      <MaterialCommunityIcons name="note-text-outline" size={26} color={p} />
    ),
    bg: "#EFFFF7",
  },
  {
    key: "chatbot",
    label: "SAMI bot",
    icon: (p) => <Ionicons name="chatbubbles-outline" size={26} color={p} />,
    bg: "#E9F7FF",
  },
];

export default function DashboardScreen() {
  const navigation = useNavigation();
  const DATA = [{ type: "header" }, { type: "features" }, { type: "info" }];

  const renderItem = ({ item }) => {
    switch (item.type) {
      case "header":
        return (
          <Header isHome={true} title="SAMI">
            <View style={{ marginTop: spacing.xs }}>
              <Text style={{ color: "#CFE1FF", fontSize: 14, marginBottom: 6 }}>
                Xin chào!
              </Text>
              <Text style={{ color: "white", fontSize: 24, fontWeight: "800" }}>
                Chào mừng bạn trở lại
              </Text>
              {/* No padding needed here, the Header container handles the bottom space now */}
            </View>
          </Header>
        );

      case "features":
        return (
          <View
            style={{
              backgroundColor: "#ffffff",
              borderRadius: 16,
              padding: spacing.lg,
              marginHorizontal: spacing.xl,
              // We added 80px padding in Header, so pulling up 50px leaves ~30px gap below text.
              marginTop: -50,
              zIndex: 99,
              shadowColor: "#000",
              shadowOpacity: 0.1,
              shadowRadius: 10,
              elevation: 4,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "700",
                color: "#1F2937",
                marginBottom: spacing.md,
              }}
            >
              Chức năng
            </Text>
            <FlatList
              data={FEATURES}
              keyExtractor={(it) => it.key}
              numColumns={3}
              scrollEnabled={false}
              columnWrapperStyle={{
                justifyContent: "space-between",
                marginBottom: spacing.lg,
              }}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => {
                    if (item.key === "residence") {
                      navigation.navigate("GuestRegistrationListScreen");
                    }
                    if (item.key === "maintenance") {
                      navigation.navigate("MaintenanceListScreen");
                    }
                    if (item.key === "bill") {
                      navigation.navigate("BillListScreen");
                    }
                    if (item.key === "chatbot") {
                      navigation.navigate("ChatbotScreen");
                    }
                    if (item.key === "vehicle") {
                      navigation.navigate("VehicleListScreen");
                    }
                    if (item.key === "rules") {
                      navigation.navigate("RegulationListScreen");
                    }
                    if (item.key === "map") {
                      navigation.navigate("FloorPlanViewScreen");
                    }
                    if (item.key === "contract") {
                      navigation.navigate("ContractScreen");
                    }
                  }}
                  style={{ width: "30%", alignItems: "center", gap: 8 }}
                >
                  <View
                    style={{
                      width: 56,
                      height: 56,
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: 16,
                      backgroundColor: item.bg,
                    }}
                  >
                    {item.icon(colors.brand)}
                  </View>
                  <Text
                    style={{
                      textAlign: "center",
                      fontSize: 12,
                      color: "#374151",
                    }}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              )}
            />
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#F3F4F6" }}>
      <FlatList
        data={DATA}
        keyExtractor={(item, index) => item.type + index}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        // Add contentContainerStyle to ensure bottom scrolling space
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </View>
  );
}
