import React, { useState, useCallback } from "react";
import { 
    View, 
    Text, 
    FlatList, 
    Pressable, 
    ActivityIndicator, 
    StyleSheet, 
    TouchableOpacity 
} from "react-native";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
import {
    Ionicons,
    MaterialCommunityIcons,
    MaterialIcons,
    FontAwesome5 // Thêm icon cho đẹp
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

// Helper format tiền tệ
const formatCurrency = (amount) => {
    if (!amount) return "0 đ";
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

export default function DashboardScreen() {
    const navigation = useNavigation();
    const [isCheckingAction, setIsCheckingAction] = useState(true);
    
    // State cho thông tin tòa nhà
    const [myBuildings, setMyBuildings] = useState([]);
    const [selectedBuildingIndex, setSelectedBuildingIndex] = useState(0);
    const [loadingBuildings, setLoadingBuildings] = useState(false);

    // Thêm mục 'building_info' vào FlatList data
    const DATA = [{ type: "header" }, { type: "features" }, { type: "building_info" }, { type: "info" }];

    useFocusEffect(
        useCallback(() => {
            performCheck();
            fetchMyBuildings(); // Gọi hàm lấy thông tin tòa nhà
        }, [])
    );

    const performCheck = async () => {
        try {
            const response = await checkPendingAction();
            if (response && response.has_pending_action && response.data?.contract_id) {
                const { contract_id } = response.data;
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

    // Hàm lấy thông tin tòa nhà
    const fetchMyBuildings = async () => {
        try {
            setLoadingBuildings(true);
            const res = await getMyBuildingDetails();
            // Backend trả về: { success: true, data: [...] } hoặc data tùy vào wrapper của bạn
            const buildings = res.data || res || []; 
            
            // Chuyển object values thành array nếu backend trả về Map dạng object
            const buildingsArray = Array.isArray(buildings) ? buildings : Object.values(buildings);
            
            setMyBuildings(buildingsArray);
        } catch (error) {
            console.log("Lỗi lấy thông tin tòa nhà:", error);
        } finally {
            setLoadingBuildings(false);
        }
    };

    // Hàm đổi tòa nhà (nếu có nhiều hơn 1)
    const switchBuilding = () => {
        if (myBuildings.length > 1) {
            setSelectedBuildingIndex((prev) => (prev + 1) % myBuildings.length);
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
                    <View style={styles.cardContainer}>
                        <Text style={styles.sectionTitle}>Chức năng</Text>
                        <FlatList
                            data={FEATURES}
                            keyExtractor={(it) => it.key}
                            numColumns={3}
                            scrollEnabled={false}
                            columnWrapperStyle={{ justifyContent: "space-between", marginBottom: spacing.lg }}
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
                                            contact: "BuildingContactScreen",
                                        };
                                        if (screens[item.key]) navigation.navigate(screens[item.key]);
                                    }}
                                    style={({ pressed }) => ({
                                        width: "30%",
                                        alignItems: "center",
                                        gap: 8,
                                        opacity: pressed ? 0.7 : 1
                                    })}
                                >
                                    <View style={[styles.iconBox, { backgroundColor: item.bg }]}>
                                        {item.icon(colors.brand)}
                                    </View>
                                    <Text style={styles.iconLabel}>{item.label}</Text>
                                </Pressable>
                            )}
                        />
                    </View>
                );

            case "building_info":
                // Nếu đang load hoặc không có dữ liệu thì không hiện hoặc hiện loading nhỏ
                if (loadingBuildings && myBuildings.length === 0) {
                    return <ActivityIndicator size="small" color={colors.brand} style={{ marginVertical: 20 }} />;
                }
                
                if (myBuildings.length === 0) return null;

                const currentBuilding = myBuildings[selectedBuildingIndex];

                return (
                    <View style={[styles.cardContainer, { marginTop: 16 }]}>
                        {/* Header của Card: Tên tòa nhà + Nút đổi */}
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                            <View style={{flex: 1}}>
                                <Text style={styles.sectionTitle}>Thông tin tòa nhà</Text>
                                <Text style={styles.buildingName} numberOfLines={1}>
                                    🏢 {currentBuilding.building_name}
                                </Text>
                            </View>
                            
                            {/* Chỉ hiện nút đổi nếu có > 1 tòa nhà */}
                            {myBuildings.length > 1 && (
                                <TouchableOpacity 
                                    onPress={switchBuilding}
                                    style={styles.switchButton}
                                >
                                    <Ionicons name="swap-horizontal" size={16} color="white" />
                                    <Text style={{color: 'white', fontSize: 12, fontWeight: '600', marginLeft: 4}}>
                                        Đổi tòa ({selectedBuildingIndex + 1}/{myBuildings.length})
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>

                        {/* Grid thông tin chi tiết */}
                        <View style={styles.infoGrid}>
                            <InfoItem 
                                icon="flash" 
                                color="#FFC107" 
                                label="Giá điện" 
                                value={`${formatCurrency(currentBuilding.electric_unit_price)} /số`} 
                            />
                            <InfoItem 
                                icon="water" 
                                color="#03A9F4" 
                                label="Giá nước" 
                                value={`${formatCurrency(currentBuilding.water_unit_price)} /khối`} 
                            />
                            <InfoItem 
                                icon="people-carry" 
                                iconLib="FontAwesome5"
                                color="#4CAF50" 
                                label="Dịch vụ" 
                                value={`${formatCurrency(currentBuilding.service_fee)} /tháng`} 
                            />
                            <InfoItem 
                                icon="calendar" 
                                color="#FF5722" 
                                label="Ngày chốt sổ" 
                                value={`Ngày ${currentBuilding.bill_due_day} hàng tháng`} 
                            />
                        </View>
                    </View>
                );

            default:
                return <View style={{ height: 100 }} />; // Spacer cuối cùng
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

// Component con để hiển thị từng ô thông tin (cho gọn code)
const InfoItem = ({ icon, color, label, value, iconLib }) => (
    <View style={styles.infoItem}>
        <View style={[styles.infoIconBox, { backgroundColor: `${color}20` }]}> 
            {/* color + 20 để tạo độ mờ (opacity hex) */}
            {iconLib === 'FontAwesome5' ? (
                <FontAwesome5 name={icon} size={20} color={color} />
            ) : (
                <Ionicons name={icon} size={20} color={color} />
            )}
        </View>
        <View style={{flex: 1}}>
            <Text style={styles.infoLabel}>{label}</Text>
            <Text style={styles.infoValue}>{value}</Text>
        </View>
    </View>
);

const styles = StyleSheet.create({
    cardContainer: {
        backgroundColor: "#ffffff",
        borderRadius: 16,
        padding: spacing.lg,
        marginHorizontal: spacing.xl,
        marginTop: -50, // Chỉ dùng cho cái feature đầu tiên, cái sau sẽ bị override style inline
        zIndex: 1, // Đặt thấp hơn feature card
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#6B7280",
        marginBottom: 4,
        textTransform: 'uppercase',
        fontSize: 12
    },
    buildingName: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#1F2937",
    },
    switchButton: {
        flexDirection: 'row',
        backgroundColor: colors.brand || '#0066CC',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        alignItems: 'center'
    },
    iconBox: {
        width: 56,
        height: 56,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 16,
    },
    iconLabel: {
        textAlign: "center",
        fontSize: 12,
        color: "#374151",
    },
    
    // Style cho phần Info Building
    infoGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginTop: 8,
        gap: 12
    },
    infoItem: {
        width: '48%', // 2 cột
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        padding: 10,
        borderRadius: 12,
        gap: 10
    },
    infoIconBox: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center'
    },
    infoLabel: {
        fontSize: 11,
        color: '#6B7280',
        marginBottom: 2
    },
    infoValue: {
        fontSize: 13,
        fontWeight: '700',
        color: '#374151'
    }
});
