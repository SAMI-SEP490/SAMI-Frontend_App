import React, { useEffect, useState, useCallback } from "react";
import { View, Text, FlatList, Pressable, ActivityIndicator } from "react-native";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
import {
    Ionicons,
    MaterialCommunityIcons,
    MaterialIcons,
} from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import Header from "../../components/Header";
import { checkPendingAction } from "../../service/api/contract";

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
        label: "Đăng ký khách",
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
    const [isCheckingAction, setIsCheckingAction] = useState(true);
    const DATA = [{ type: "header" }, { type: "features" }, { type: "info" }];

    // Dùng useFocusEffect để check lại mỗi khi màn hình được focus
    useFocusEffect(
        useCallback(() => {
            performCheck();
        }, [])
    );

    const performCheck = async () => {
        try {
            console.log("Đang kiểm tra pending actions...");

            // Gọi API
            const response = await checkPendingAction();
            console.log("Response API Check:", JSON.stringify(response));

            // --- SỬA LOGIC Ở ĐÂY ---
            // JSON trả về: { has_pending_action: true, data: { contract_id: 3 } }
            // Cần check response.data?.contract_id thay vì response.contract_id
            if (response && response.has_pending_action && response.data?.contract_id) {

                const { contract_id, action_type, contract_number } = response.data;
                console.log(`Phát hiện Action: ${action_type} cho HĐ #${contract_number}`);

                // Reset stack và chuyển hướng
                navigation.reset({
                    index: 0,
                    routes: [
                        {
                            name: 'ContractActionScreen',
                            params: { contractId: contract_id }
                        }
                    ],
                });
            } else {
                // Không có action -> Tắt loading để hiện Dashboard
                setIsCheckingAction(false);
            }
        } catch (error) {
            console.log("Lỗi check pending action:", error);
            setIsCheckingAction(false);
        }
    };

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
                                        const screens = {
                                            residence: "GuestRegistrationListScreen",
                                            maintenance: "MaintenanceListScreen",
                                            bill: "BillListScreen",
                                            chatbot: "ChatbotScreen",
                                            vehicle: "VehicleListScreen",
                                            rules: "RegulationListScreen",
                                            map: "FloorPlanViewScreen",
                                            contract: "ContractScreen",
                                        };

                                        if (screens[item.key]) {
                                            navigation.navigate(screens[item.key]);
                                        }
                                    }}
                                    style={({ pressed }) => ({
                                        width: "30%",
                                        alignItems: "center",
                                        gap: 8,
                                        opacity: pressed ? 0.7 : 1
                                    })}
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

    // Hiển thị loading khi đang check API
    if (isCheckingAction) {
        return (
            <View style={{ flex: 1, backgroundColor: colors.brand || '#0066CC', justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="white" />
                <Text style={{ color: 'white', marginTop: 12, fontWeight: '600', fontSize: 16 }}>
                    Đang kiểm tra thông tin...
                </Text>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: "#F3F4F6" }}>
            <FlatList
                data={DATA}
                keyExtractor={(item, index) => item.type + index}
                renderItem={renderItem}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 40 }}
            />
        </View>
    );
}