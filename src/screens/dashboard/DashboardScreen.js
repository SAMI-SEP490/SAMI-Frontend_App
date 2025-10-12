import React from "react";
import {
  SafeAreaView,
  StatusBar,
  View,
  Text,
  FlatList,
  Pressable,
} from "react-native";
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
    key: "parking",
    label: "Đăng ký gửi xe",
    icon: (p) => <Ionicons name="car-outline" size={26} color={p} />,
    bg: "#E9FBE7",
  },
  {
    key: "residence",
    label: "Đăng ký tạm trú",
    icon: (p) => (
      <MaterialCommunityIcons
        name="file-document-outline"
        size={26}
        color={p}
      />
    ),
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
    label: "Yêu cầu bảo trì",
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
];

export default function DashboardScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle="light-content" />

      {/* HEADER XANH */}
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
        <Header />
        <Text style={{ color: "#CFE1FF", fontSize: 14, marginBottom: 6 }}>
          Xin chào!
        </Text>
        <Text style={{ color: "white", fontSize: 22, fontWeight: "800" }}>
          Chào mừng bạn trở lại
        </Text>
      </View>

      {/* BODY */}
      <View style={{ flex: 1, paddingHorizontal: spacing.xl, marginTop: -18 }}>
        {/* CARD: Chức năng */}
        <View
          style={{
            backgroundColor: colors.card,
            borderRadius: 14,
            padding: spacing.lg,
            shadowColor: "#000",
            shadowOpacity: 0.06,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 2 },
            elevation: 2,
          }}
        >
          <Text
            style={{
              fontSize: 16,
              fontWeight: "700",
              color: colors.text,
              marginBottom: spacing.md,
            }}
          >
            Chức năng
          </Text>

          <FlatList
            data={FEATURES}
            keyExtractor={(it) => it.key}
            numColumns={3}
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
                    color: colors.text,
                  }}
                >
                  {item.label}
                </Text>
              </Pressable>
            )}
            ListFooterComponent={<View style={{ height: spacing.sm }} />}
          />
        </View>

        <View style={{ height: spacing.lg }} />

        {/* CARD: Thông tin căn hộ */}
        <View
          style={{
            backgroundColor: colors.card,
            borderRadius: 14,
            padding: spacing.lg,
            shadowColor: "#000",
            shadowOpacity: 0.06,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 2 },
            elevation: 2,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: spacing.md,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "700",
                color: colors.text,
                flex: 1,
              }}
            >
              Thông tin căn hộ
            </Text>
            <Pressable onPress={() => {}}>
              <Text style={{ color: colors.brand, fontWeight: "700" }}>
                Xem chi tiết
              </Text>
            </Pressable>
          </View>

          <InfoRow label="Căn hộ" value="A-1205" />
          <InfoRow label="Tòa nhà" value="Tòa A" />
          <InfoRow
            label="Trạng thái"
            value={
              <View
                style={{
                  backgroundColor: "#E6FFF1",
                  borderRadius: 999,
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                }}
              >
                <Text
                  style={{
                    color: colors.success,
                    fontWeight: "700",
                    fontSize: 12,
                  }}
                >
                  Đã thanh toán
                </Text>
              </View>
            }
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

function InfoRow({ label, value }) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}
    >
      <Text style={{ color: colors.muted, flex: 1 }}>{label}</Text>
      {typeof value === "string" ? (
        <Text style={{ color: colors.text, fontWeight: "600" }}>{value}</Text>
      ) : (
        value
      )}
    </View>
  );
}
