import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
import {
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
  FontAwesome5,
} from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import Header from "../../components/Header";
import { checkPendingAction } from "../../service/api/contract";
import { getMyBuildingDetails } from "../../service/api/building";

const FEATURES = [
  {
    key: "bill",
    label: "Thanh toán hóa đơn",
    icon: (p) => <Ionicons name="card-outline" size={26} color={p} />,
    bg: "#E9F1FF",
  },
  {
    key: "vehicle",
    label: "Phương tiện cá nhân",
    icon: (p) => <Ionicons name="car-outline" size={26} color={p} />,
    bg: "#E9FBE7",
  },
  {
    key: "residence",
    label: "Báo cáo khách đến",
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
    key: "contact",
    label: "Liên hệ quản lý",
    icon: (p) => <Ionicons name="call-outline" size={26} color={p} />,
    bg: "#FFF9C4",
  },
  {
    key: "chatbot",
    label: "SAMI Bot",
    icon: (p) => <Ionicons name="chatbubbles-outline" size={26} color={p} />,
    bg: "#E9F7FF",
  },
];

const formatCurrency = (amount) => {
  if (!amount) return "0 đ";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

export default function DashboardScreen() {
  const navigation = useNavigation();
  const [isCheckingAction, setIsCheckingAction] = useState(true);

  const [myBuildings, setMyBuildings] = useState([]);
  const [selectedBuildingIndex, setSelectedBuildingIndex] = useState(0);
  const [loadingBuildings, setLoadingBuildings] = useState(false);

  const DATA = [
    { type: "header" },
    { type: "features" },
    { type: "building_info" },
    { type: "info" },
  ];

  useFocusEffect(
    useCallback(() => {
      performCheck();
      fetchMyBuildings();
    }, []),
  );

  const performCheck = async () => {
    try {
      const response = await checkPendingAction();
      if (response?.has_pending_action && response.data?.contract_id) {
        navigation.reset({
          index: 0,
          routes: [
            {
              name: "ContractActionScreen",
              params: { contractId: response.data.contract_id },
            },
          ],
        });
      } else {
        setIsCheckingAction(false);
      }
    } catch {
      setIsCheckingAction(false);
    }
  };

  const fetchMyBuildings = async () => {
    try {
      setLoadingBuildings(true);
      const res = await getMyBuildingDetails();
      const buildings = res.data || res || [];
      setMyBuildings(
        Array.isArray(buildings) ? buildings : Object.values(buildings),
      );
    } finally {
      setLoadingBuildings(false);
    }
  };

  const switchBuilding = () => {
    if (myBuildings.length > 1) {
      setSelectedBuildingIndex((prev) => (prev + 1) % myBuildings.length);
    }
  };

  const renderItem = ({ item }) => {
    if (item.type === "header") {
      return (
        <Header isHome title="SAMI">
          <Text style={{ color: "#CFE1FF", marginTop: 8 }}>Xin chào!</Text>
          <Text style={{ color: "white", fontSize: 24, fontWeight: "800" }}>
            Chào mừng bạn trở lại
          </Text>
        </Header>
      );
    }

    if (item.type === "features") {
      return (
        <View style={styles.cardContainer}>
          <Text style={styles.sectionTitle}>Chức năng</Text>
          <FlatList
            data={FEATURES}
            numColumns={3}
            scrollEnabled={false}
            columnWrapperStyle={{
              justifyContent: "space-between",
              marginBottom: spacing.lg,
            }}
            renderItem={({ item }) => (
              <Pressable style={{ width: "30%", alignItems: "center" }}>
                <View style={[styles.iconBox, { backgroundColor: item.bg }]}>
                  {item.icon(colors.brand)}
                </View>
                <Text style={styles.iconLabel}>{item.label}</Text>
              </Pressable>
            )}
          />
        </View>
      );
    }

    if (item.type === "building_info") {
      if (loadingBuildings && myBuildings.length === 0) {
        return <ActivityIndicator style={{ marginVertical: 20 }} />;
      }
      if (myBuildings.length === 0) return null;

      const b = myBuildings[selectedBuildingIndex];

      return (
        <View style={[styles.cardContainer, { marginTop: 16 }]}>
          <View style={styles.buildingHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.sectionTitle}>Thông tin tòa nhà</Text>
              <Text style={styles.buildingName}>🏢 {b.building_name}</Text>
            </View>
            {myBuildings.length > 1 && (
              <TouchableOpacity
                onPress={switchBuilding}
                style={styles.switchButton}
              >
                <Ionicons name="swap-horizontal" size={16} color="white" />
                <Text style={styles.switchText}>
                  {selectedBuildingIndex + 1}/{myBuildings.length}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* ⭐ GRID FIXED 2x2 */}
          <View style={styles.infoGrid}>
            <InfoItem
              icon="flash"
              color="#FFC107"
              label="Giá điện"
              value={`${formatCurrency(b.electric_unit_price)} /số`}
            />
            <InfoItem
              icon="water"
              color="#03A9F4"
              label="Giá nước"
              value={`${formatCurrency(b.water_unit_price)} /khối`}
            />
            <InfoItem
              icon="people-carry"
              iconLib="FontAwesome5"
              color="#4CAF50"
              label="Dịch vụ"
              value={`${formatCurrency(b.service_fee)} /tháng`}
            />
            <InfoItem
              icon="calendar"
              color="#FF5722"
              label="Ngày chốt sổ"
              value={`Ngày ${b.bill_closing_day}`}
            />
          </View>
        </View>
      );
    }

    return <View style={{ height: 100 }} />;
  };

  if (isCheckingAction) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color="white" />
        <Text style={styles.loadingText}>Đang kiểm tra thông tin...</Text>
      </View>
    );
  }

  return (
    <FlatList
      style={{ backgroundColor: "#F3F4F6" }}
      data={DATA}
      keyExtractor={(i, idx) => i.type + idx}
      renderItem={renderItem}
      contentContainerStyle={{ paddingBottom: 40 }}
    />
  );
}

const InfoItem = ({ icon, color, label, value, iconLib }) => (
  <View style={styles.infoItem}>
    <View style={[styles.infoIconBox, { backgroundColor: `${color}20` }]}>
      {iconLib === "FontAwesome5" ? (
        <FontAwesome5 name={icon} size={20} color={color} />
      ) : (
        <Ionicons name={icon} size={20} color={color} />
      )}
    </View>
    <View style={{ flex: 1 }}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: spacing.lg,
    marginHorizontal: spacing.xl,
    marginTop: -50,
    elevation: 2,
  },

  sectionTitle: { fontSize: 12, fontWeight: "700", color: "#6B7280" },
  buildingName: { fontSize: 18, fontWeight: "bold" },

  buildingHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  switchButton: {
    flexDirection: "row",
    backgroundColor: colors.brand,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignItems: "center",
  },

  switchText: { color: "white", fontSize: 12, marginLeft: 6 },

  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  iconLabel: { fontSize: 12, textAlign: "center" },

  /* ⭐ FIXED GRID */
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
  },
  infoItem: {
    flexBasis: "48%",
    marginHorizontal: "1%",
    marginBottom: 12,
    flexDirection: "row",
    backgroundColor: "#F9FAFB",
    padding: 10,
    borderRadius: 12,
  },

  infoIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  infoLabel: { fontSize: 11, color: "#6B7280" },
  infoValue: { fontSize: 13, fontWeight: "700" },

  loadingScreen: {
    flex: 1,
    backgroundColor: colors.brand,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: { color: "white", marginTop: 12 },
});
