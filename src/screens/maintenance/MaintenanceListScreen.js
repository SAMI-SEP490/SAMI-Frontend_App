import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  Modal,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import Header from "../../components/Header";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
import { getRoomMaintenanceHistory, deleteMaintenanceRequest } from "../../service/api/maintenance";
import { getRoomsByUserId } from "../../service/api/room";
import { useAuthStore } from "../../auth";

// ... (STATUS_CONFIG, CATEGORY_MAP giữ nguyên) ...
const STATUS_CONFIG = {
  pending: { label: "Đang chờ", color: "#D97706", bg: "#FEF3C7" },
  in_progress: { label: "Đang xử lý", color: "#2563EB", bg: "#EFF6FF" },
  on_hold: { label: "Tạm hoãn", color: "#4B5563", bg: "#F3F4F6" },
  resolved: { label: "Đã xử lý", color: "#059669", bg: "#D1FAE5" },
  completed: { label: "Hoàn thành", color: "#16A34A", bg: "#DCFCE7" },
  cancelled: { label: "Đã hủy", color: "#9CA3AF", bg: "#F9FAFB" },
  rejected: { label: "Từ chối", color: "#EF4444", bg: "#FEE2E2" },
};

const CATEGORY_MAP = {
  plumbing: "Ống nước",
  electrical: "Điện",
  hvac: "Điều hòa",
  carpentry: "Mộc",
  structural: "Kết cấu",
  cleaning: "Vệ sinh",
  other: "Khác",
};

const MaintenanceListScreen = () => {
  const navigation = useNavigation();
  
  const [maintenanceData, setMaintenanceData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  
  const [filterCategory, setFilterCategory] = useState(null);
  const [filterStatus, setFilterStatus] = useState(null);
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const user = useAuthStore((state) => state.user);

  const fetchMaintenanceData = async () => {
    try {
      if (!refreshing) setLoading(true);
      const userId = user?.id || user?.user_id;
      if (!userId) return;

      const roomRes = await getRoomsByUserId(userId);
      const data = roomRes.data || roomRes;

      let targetRoomIds = [];

      // [FIX] Lấy từ mảng 'rooms' (logic mới)
      if (data.rooms && Array.isArray(data.rooms)) {
        targetRoomIds = data.rooms.map(r => ({
          id: r.room_id,
          name: r.room_number,
          building: r.building_name
        }));
      }
      // Fallback logic cũ
      else if (data.current_room) {
        targetRoomIds.push({
          id: data.current_room.room_id,
          name: data.current_room.room_number,
          building: data.current_room.building_name
        });
      }

      if (targetRoomIds.length === 0) {
        setMaintenanceData([]);
        setFilteredData([]);
        setLoading(false);
        return;
      }

      // Gọi API lấy history cho TẤT CẢ các phòng (Parallel)
      const promises = targetRoomIds.map(async (room) => {
          try {
              const historyRes = await getRoomMaintenanceHistory(room.id);
              const items = historyRes?.data?.data || historyRes?.data || [];
              // Gán thêm thông tin phòng vào từng item
              return items.map(item => ({
                  ...item,
                  roomName: room.name,
                  buildingName: room.building
              }));
          } catch (e) {
              console.warn(`Failed to fetch history for room ${room.id}`, e);
              return [];
          }
      });

      const results = await Promise.all(promises);
      const allRequests = results.flat();

      // Sort by newest
      allRequests.sort((a, b) => b.request_id - a.request_id);
      
      setMaintenanceData(allRequests);
      setFilteredData(allRequests);

    } catch (error) {
      console.error("Fetch Error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchMaintenanceData();
    }, [])
  );

  useEffect(() => {
    let data = maintenanceData;
    if (filterCategory) data = data.filter((i) => i.category === filterCategory);
    if (filterStatus) data = data.filter((i) => i.status === filterStatus);
    setFilteredData(data);
  }, [maintenanceData, filterCategory, filterStatus]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchMaintenanceData();
  };

  const handleDelete = (requestId) => {
    Alert.alert("Xác nhận xóa", "Bạn chắc chắn muốn xóa yêu cầu bảo trì này?", [
        { text: "Hủy", style: "cancel" },
        { text: "Xóa", style: "destructive", onPress: async () => {
            try { await deleteMaintenanceRequest(requestId); fetchMaintenanceData(); } 
            catch (error) { Alert.alert("Lỗi", "Không thể xóa yêu cầu."); }
        }},
    ]);
  };

  const handlePressItem = (item) => {
      navigation.navigate("UpdateMaintenanceRequestScreen", { requestId: item.request_id });
  };

  // ... (FilterModal component giữ nguyên) ...
  const FilterModal = () => { /* ... code cũ ... */ 
    return (
      <Modal visible={filterModalVisible} transparent animationType="fade" onRequestClose={() => setFilterModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Bộ lọc</Text>
            <Text style={styles.sectionTitle}>Loại bảo trì</Text>
            <View style={styles.wrapRow}>
              {Object.entries(CATEGORY_MAP).map(([key, label]) => (
                <TouchableOpacity key={key} style={[styles.chip, filterCategory === key && styles.chipActive]} onPress={() => setFilterCategory(key === filterCategory ? null : key)}>
                  <Text style={[styles.chipText, filterCategory === key && styles.chipTextActive]}>{label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.sectionTitle}>Trạng thái</Text>
            <View style={styles.wrapRow}>
              {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                <TouchableOpacity key={key} style={[styles.chip, filterStatus === key && styles.chipActive]} onPress={() => setFilterStatus(key === filterStatus ? null : key)}>
                  <Text style={[styles.chipText, filterStatus === key && styles.chipTextActive]}>{config.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalBtn, {backgroundColor: '#F3F4F6'}]} onPress={() => {setFilterCategory(null); setFilterStatus(null); setFilterModalVisible(false);}}>
                <Text style={{color: '#374151', fontWeight: '600'}}>Xóa lọc</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, {backgroundColor: colors.brand}]} onPress={() => setFilterModalVisible(false)}>
                <Text style={{color: 'white', fontWeight: '600'}}>Áp dụng</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  const renderItem = ({ item }) => {
    const statusStyle = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;
    const dateStr = item.created_at ? new Date(item.created_at).toLocaleDateString('vi-VN') : "N/A";

    return (
      <TouchableOpacity style={styles.card} activeOpacity={0.9} onPress={() => handlePressItem(item)}>
        <View style={styles.cardHeader}>
          <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
             <View style={styles.iconBox}>
                <Ionicons name="construct" size={20} color={colors.brand} />
             </View>
             <View>
                 <Text style={styles.cardTitle}>Đơn #{item.request_id}</Text>
                 {/* [UPDATE] Hiển thị tên phòng và tòa nhà */}
                 <Text style={styles.roomLabel}>
                    P.{item.roomName} • {item.buildingName}
                 </Text>
             </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.statusText, { color: statusStyle.color }]}>
              {statusStyle.label || item.status}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.row}>
            <Text style={styles.label}>Loại:</Text>
            <Text style={styles.value}>{CATEGORY_MAP[item.category] || item.category}</Text>
        </View>
        
        <View style={styles.row}>
            <Text style={styles.label}>Ngày gửi:</Text>
            <Text style={styles.value}>{dateStr}</Text>
        </View>

        <Text style={styles.descriptionLabel}>Mô tả:</Text>
        <Text style={styles.description} numberOfLines={2}>{item.description}</Text>

        {item.status === 'pending' && (
            <View style={styles.actionRow}>
                <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item.request_id)}>
                    <Ionicons name="trash-outline" size={16} color="#EF4444" />
                    <Text style={styles.deleteText}>Xóa yêu cầu</Text> 
                </TouchableOpacity>
                <View style={{flex: 1, alignItems: 'flex-end'}}>
                    <Text style={{fontSize: 12, color: colors.brand, fontWeight: '600'}}>Chạm để sửa</Text>
                </View>
            </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <Header title="Bảo trì" isHome={false} />
      <FilterModal />

      <View style={styles.contentContainer}>
        <View style={styles.topRow}>
            <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate("CreateMaintenanceRequestScreen")}>
                <Ionicons name="add-circle" size={20} color="white" />
                <Text style={styles.addButtonText}>Tạo yêu cầu mới</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.filterButton} onPress={() => setFilterModalVisible(true)}>
                <Ionicons name="filter" size={20} color={colors.brand} />
            </TouchableOpacity>
        </View>

        {loading && !refreshing ? (
             <ActivityIndicator size="large" color={colors.brand} style={{marginTop: 40}} />
        ) : (
            <FlatList
                data={filteredData}
                keyExtractor={(item) => item.request_id?.toString()}
                renderItem={renderItem}
                contentContainerStyle={{ paddingBottom: 40 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                ListEmptyComponent={
                    <View style={{alignItems: 'center', marginTop: 40}}>
                        <Text style={{color: colors.muted}}>
                           {maintenanceData.length === 0 ? "Chưa có lịch sử bảo trì." : "Không tìm thấy kết quả phù hợp."}
                        </Text>
                    </View>
                }
            />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // ... (Copy styles cũ và thêm roomLabel) ...
  container: { flex: 1, backgroundColor: colors.brand },
  contentContainer: { flex: 1, backgroundColor: "#F3F4F6", marginTop: -24, borderTopLeftRadius: 0, borderTopRightRadius: 0, paddingHorizontal: spacing.md, paddingTop: spacing.xl + 24 },
  topRow: { flexDirection: "row", gap: 10, marginBottom: spacing.md },
  addButton: { flex: 1, backgroundColor: colors.brand, flexDirection: "row", alignItems: "center", justifyContent: "center", padding: 12, borderRadius: 12, gap: 8, elevation: 2 },
  addButtonText: { color: "white", fontWeight: "700", fontSize: 15 },
  filterButton: { backgroundColor: "white", width: 48, alignItems: "center", justifyContent: "center", borderRadius: 12, borderWidth: 1, borderColor: "#E5E7EB" },
  
  card: { backgroundColor: "white", borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }, // Align flex-start để text dài không vỡ layout
  iconBox: { width: 36, height: 36, borderRadius: 8, backgroundColor: "#E0F2FE", alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontSize: 16, fontWeight: "700", color: "#111827" },
  
  // [NEW] Style cho tên phòng
  roomLabel: { fontSize: 12, color: "#6B7280", marginTop: 2, fontWeight: '500' },

  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start' }, // Badge căn lề trên
  statusText: { fontSize: 11, fontWeight: "700", textTransform: "uppercase" },
  divider: { height: 1, backgroundColor: "#F3F4F6", marginVertical: 8 },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  label: { fontSize: 13, color: "#6B7280" },
  value: { fontSize: 13, color: "#111827", fontWeight: "500" },
  descriptionLabel: { fontSize: 13, color: "#6B7280", marginTop: 4 },
  description: { fontSize: 13, color: "#374151", fontStyle: 'italic', marginTop: 2 },
  actionRow: { marginTop: 12, borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 8, flexDirection: 'row', alignItems: 'center' },
  deleteButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4, paddingRight: 10 },
  deleteText: { color: '#EF4444', fontSize: 12, fontWeight: '600', marginLeft: 4 },

  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  modalContent: { width: "85%", backgroundColor: "white", borderRadius: 16, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: "700", marginBottom: 16, textAlign: 'center' },
  sectionTitle: { fontSize: 14, fontWeight: "600", marginTop: 10, marginBottom: 8, color: '#4B5563' },
  wrapRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: "#E5E7EB", backgroundColor: "white" },
  chipActive: { borderColor: colors.brand, backgroundColor: "#EFF6FF" },
  chipText: { fontSize: 13, color: "#374151" },
  chipTextActive: { color: colors.brand, fontWeight: "600" },
  modalActions: { flexDirection: "row", gap: 10, marginTop: 24 },
  modalBtn: { flex: 1, padding: 12, borderRadius: 10, alignItems: 'center' },
});

export default MaintenanceListScreen;