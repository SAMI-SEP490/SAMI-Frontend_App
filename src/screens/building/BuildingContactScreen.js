import React, { useState, useCallback, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  StatusBar,
  Linking,
  Alert
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";

import Header from "../../components/Header";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
import { getBuildingContacts } from "../../service/api/building";

// Helper xử lý màu sắc giới tính "bất chấp" data đầu vào
const getGenderColor = (rawGender) => {
    if (!rawGender) return "#9CA3AF"; // Mặc định màu Xám nếu null/undefined
    // 1. Chuẩn hóa: Chuyển về chữ thường, xóa khoảng trắng
    const g = String(rawGender).toLowerCase().trim();
    // 2. Định nghĩa các từ khóa cho Nam (Blue)
    const maleKeywords = ['male', 'nam', 'trai', 'man', 'm'];
    // 3. Định nghĩa các từ khóa cho Nữ (Pink)
    const femaleKeywords = ['female', 'nu', 'nữ', 'gai', 'gái', 'woman', 'f'];
    // 4. Kiểm tra
    if (maleKeywords.includes(g)) return "#3B82F6"; // Xanh dương
    if (femaleKeywords.includes(g)) return "#EC4899"; // Hồng
    return "#9CA3AF"; // Các trường hợp còn lại (Other, Khác, ...) -> Xám
};

// Cấu hình Role
const ROLE_CONFIG = {
  MANAGER: { label: "Quản lý", bg: "#EFF6FF", text: "#2563EB" },
  OWNER: { label: "Chủ nhà", bg: "#F3E8FF", text: "#9333EA" },
};

export default function BuildingContactScreen() {
  const navigation = useNavigation();

  const [rawData, setRawData] = useState([]); // Data gốc từ API (mảng tòa nhà)
  const [flatContacts, setFlatContacts] = useState([]); // Data đã làm phẳng để render
  const [filteredData, setFilteredData] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  
  // Filter state
  const [filterRole, setFilterRole] = useState(null);
  const [filterBuildingId, setFilterBuildingId] = useState(null);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const res = await getBuildingContacts();
      const data = res?.data || [];
      
      setRawData(data);
      processData(data);

    } catch (err) {
      console.error(err);
      setRawData([]);
      setFlatContacts([]);
    } finally {
      setLoading(false);
    }
  };

  // Hàm xử lý dữ liệu: Flatten + Sort
  const processData = (buildings) => {
    let allContacts = [];

    buildings.forEach(b => {
      if (b.contacts && b.contacts.length > 0) {
        // Gán thêm tên tòa nhà vào từng contact để hiển thị
        const contactsWithBuilding = b.contacts.map(c => ({
          ...c,
          building_id: b.building_id,
          building_name: b.building_name
        }));
        allContacts = [...allContacts, ...contactsWithBuilding];
      }
    });

    // Sắp xếp: MANAGER trước, OWNER sau
    allContacts.sort((a, b) => {
      if (a.role === 'MANAGER' && b.role === 'OWNER') return -1;
      if (a.role === 'OWNER' && b.role === 'MANAGER') return 1;
      return 0;
    });

    setFlatContacts(allContacts);
    setFilteredData(allContacts);
  };

  useFocusEffect(
    useCallback(() => {
      fetchContacts();
    }, [])
  );

  // Xử lý Filter
  useEffect(() => {
    let data = flatContacts;
    if (filterRole) {
      data = data.filter(c => c.role === filterRole);
    }
    if (filterBuildingId) {
      data = data.filter(c => c.building_id === filterBuildingId);
    }
    setFilteredData(data);
  }, [flatContacts, filterRole, filterBuildingId]);

  // Hành động gọi điện / gửi mail
  const handleCall = (phone) => {
    if (!phone) return;
    Linking.openURL(`tel:${phone}`);
  };

  const renderItem = ({ item }) => {
    const genderColor = getGenderColor(item.gender);
    const roleInfo = ROLE_CONFIG[item.role] || { label: item.role, bg: "#F3F4F6", text: "#374151" };

    return (
      <View style={[styles.card, { borderLeftColor: genderColor, borderLeftWidth: 4 }]}>
        {/* Header: Tên + Role */}
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.nameText}>{item.full_name || "Không tên"}</Text>
            <Text style={styles.buildingText}>🏢 {item.building_name}</Text>
          </View>
          <View style={[styles.roleBadge, { backgroundColor: roleInfo.bg }]}>
            <Text style={[styles.roleText, { color: roleInfo.text }]}>{roleInfo.label}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Thông tin liên hệ */}
        <View style={styles.contactRow}>
            {/* Phone */}
            <TouchableOpacity 
                style={styles.actionButton} 
                onPress={() => handleCall(item.phone)}
                disabled={!item.phone}
            >
                <View style={[styles.iconCircle, { backgroundColor: '#E0F2FE' }]}>
                    <Ionicons name="call" size={18} color={colors.brand} />
                </View>
                <Text style={styles.actionText}>{item.phone || "---"}</Text>
            </TouchableOpacity>
        </View>
      </View>
    );
  };

  const FilterModal = () => {
    // Lấy danh sách role và building duy nhất để tạo option lọc
    const roles = ['MANAGER', 'OWNER'];
    const buildings = rawData.map(b => ({ id: b.building_id, name: b.building_name }));

    return (
      <Modal
        visible={filterModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Bộ lọc liên hệ</Text>

            <Text style={styles.sectionTitle}>Chức vụ</Text>
            <View style={styles.wrapRow}>
              {roles.map((r) => (
                <TouchableOpacity
                  key={r}
                  style={[styles.chip, filterRole === r && styles.chipActive]}
                  onPress={() => setFilterRole(filterRole === r ? null : r)}
                >
                  <Text style={[styles.chipText, filterRole === r && styles.chipTextActive]}>
                    {ROLE_CONFIG[r]?.label || r}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.sectionTitle}>Tòa nhà</Text>
            <View style={styles.wrapRow}>
              {buildings.map((b) => (
                <TouchableOpacity
                  key={b.id}
                  style={[styles.chip, filterBuildingId === b.id && styles.chipActive]}
                  onPress={() => setFilterBuildingId(filterBuildingId === b.id ? null : b.id)}
                >
                  <Text style={[styles.chipText, filterBuildingId === b.id && styles.chipTextActive]}>
                    {b.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: '#F3F4F6' }]}
                onPress={() => {
                  setFilterRole(null);
                  setFilterBuildingId(null);
                  setFilterModalVisible(false);
                }}
              >
                <Text style={{ color: '#374151', fontWeight: '600' }}>Xóa lọc</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: colors.brand }]}
                onPress={() => setFilterModalVisible(false)}
              >
                <Text style={{ color: 'white', fontWeight: '600' }}>Áp dụng</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <Header title="Danh bạ tòa nhà" isHome={false} />
      <FilterModal />

      <View style={styles.contentContainer}>
        {/* Top Actions: Chỉ hiện nút Filter vì không có nút Add */}
        <View style={styles.topRow}>
          <Text style={styles.resultText}>Tìm thấy {filteredData.length} liên hệ</Text>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setFilterModalVisible(true)}
          >
            <Ionicons name="filter" size={20} color={colors.brand} />
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={colors.brand} style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={filteredData}
            renderItem={renderItem}
            keyExtractor={(item, index) => `${item.user_id}-${index}`}
            contentContainerStyle={{ paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={{ alignItems: 'center', marginTop: 40 }}>
                <Text style={{ color: colors.muted }}>Không tìm thấy thông tin liên hệ.</Text>
              </View>
            }
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.brand },
  contentContainer: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    marginTop: -24,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xl + 24,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  resultText: { fontSize: 14, color: '#6B7280', fontWeight: '500' },
  filterButton: {
    backgroundColor: "white",
    width: 40, height: 40,
    alignItems: "center", justifyContent: "center",
    borderRadius: 12,
    borderWidth: 1, borderColor: colors.border,
  },
  
  // Card Styles
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 5, elevation: 2,
    // Border left width handled inline based on gender
  },
  cardHeader: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12
  },
  nameText: { fontSize: 16, fontWeight: "700", color: "#111827", marginBottom: 2 },
  buildingText: { fontSize: 12, color: "#6B7280" },
  
  roleBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  roleText: { fontSize: 11, fontWeight: "700", textTransform: "uppercase" },
  
  divider: { height: 1, backgroundColor: "#F3F4F6", marginBottom: 12 },
  
  contactRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  actionButton: {
      flex: 1, flexDirection: 'row', alignItems: 'center', 
      backgroundColor: '#F9FAFB', padding: 8, borderRadius: 10, gap: 8
  },
  iconCircle: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  actionText: { fontSize: 13, color: '#374151', fontWeight: '500', flex: 1 },

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
  modalBtn: { flex: 1, padding: 12, borderRadius: 10, alignItems: "center" },
});
