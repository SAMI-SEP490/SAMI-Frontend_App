import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  ScrollView,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import Header from "../../components/Header";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
import { getMyBills } from "../../service/api/bill";

// --- CONFIG MAPPING ---
const STATUS_CONFIG = {
  issued: { label: "Chờ thanh toán", color: "#D97706", bg: "#FEF3C7" },
  partially_paid: { label: "Thanh toán 1 phần", color: "#2563EB", bg: "#EFF6FF" },
  paid: { label: "Đã thanh toán", color: "#16A34A", bg: "#DCFCE7" },
  overdue: { label: "Quá hạn", color: "#DC2626", bg: "#FEE2E2" },
  cancelled: { label: "Đã hủy", color: "#6B7280", bg: "#F3F4F6" },
  draft: { label: "Nháp", color: "#9CA3AF", bg: "#F3F4F6" },
};

const TYPE_CONFIG = {
  monthly_rent: { label: "Tiền thuê", icon: "home" },
  utilities: { label: "Điện nước", icon: "flash" },
  maintenance: { label: "Bảo trì", icon: "construct" },
  penalty: { label: "Phạt", icon: "warning" },
  deposit: { label: "Đặt cọc", icon: "wallet" },
  other: { label: "Khác", icon: "document-text" },
};

// --- STATUS FILTER ---
const FILTER_OPTIONS = [
  { key: 'all', label: 'Tất cả' },
  { key: 'unpaid', label: 'Cần thanh toán' },
  { key: 'paid', label: 'Đã thanh toán' },
  { key: 'cancelled', label: 'Đã hủy' },
];

export default function BillListScreen() {
  const navigation = useNavigation();

  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  
  // Filters
  const [filterKey, setFilterKey] = useState('all');
  const [selectedRoom, setSelectedRoom] = useState('all');

  const fetchBills = async () => {
    try {
      if (!refreshing) setLoading(true);
      const res = await getMyBills();
      const list = res?.data || [];
      // Sort by newest billing period
      list.sort((a, b) => new Date(b.billing_period_start) - new Date(a.billing_period_start));
      setBills(list);
    } catch (error) {
      console.error("Bill fetch error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchBills();
      setSelectedIds([]);
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchBills();
  };

  // --- LOGIC: PERMISSION ---
  // Now simpler! We rely on 'is_payer' from backend.
  const canSelect = (bill) => {
    return bill.is_payer && ["issued", "overdue", "partially_paid"].includes(bill.status);
  };

  const toggleSelection = (bill) => {
    if (!canSelect(bill)) return;

    setSelectedIds((prev) =>
      prev.includes(bill.bill_id) 
        ? prev.filter((id) => id !== bill.bill_id) 
        : [...prev, bill.bill_id]
    );
  };

  // --- EXTRACT ROOMS FOR FILTER ---
  const uniqueRooms = useMemo(() => {
    const rooms = new Set();
    bills.forEach(b => {
        // Backend now returns 'room_number' directly
        if (b.room_number) rooms.add(b.room_number);
    });
    return Array.from(rooms);
  }, [bills]);

  // --- FILTER LOGIC ---
  const filteredBills = useMemo(() => {
    return bills.filter(b => {
        // 1. Status Filter
        let statusMatch = true;
        if (filterKey === 'unpaid') {
            statusMatch = ["issued", "overdue", "partially_paid"].includes(b.status);
        } else if (filterKey !== 'all') {
            statusMatch = b.status === filterKey;
        }

        // 2. Room Filter
        let roomMatch = true;
        if (selectedRoom !== 'all') {
            roomMatch = b.room_number === selectedRoom;
        }

        return statusMatch && roomMatch;
    });
  }, [bills, filterKey, selectedRoom]);

  const totalSelectedAmount = useMemo(() => {
    return filteredBills
      .filter((b) => selectedIds.includes(b.bill_id))
      .reduce((sum, b) => {
        const total = Number(b.total_amount || 0) + Number(b.penalty_amount || 0);
        const paid = Number(b.paid_amount || 0);
        return sum + (total - paid);
      }, 0);
  }, [filteredBills, selectedIds]);

  const handlePayNow = () => {
    if (selectedIds.length === 0) return;
    const selectedBills = bills.filter(b => selectedIds.includes(b.bill_id));
    navigation.navigate("OnlinePaymentScreen", { bills: selectedBills });
  };

  const renderItem = ({ item }) => {
    const statusCfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.draft;
    const typeCfg = TYPE_CONFIG[item.bill_type] || TYPE_CONFIG.other;
    const isSelected = selectedIds.includes(item.bill_id);
    
    // Logic using new backend flags
    const assignedToMe = item.is_payer;
    const selectable = canSelect(item);
    
    // Amounts
    const totalDue = Number(item.total_amount) + Number(item.penalty_amount || 0);
    const paid = Number(item.paid_amount || 0);
    const remaining = totalDue - paid;

    return (
      <TouchableOpacity
        style={[
            styles.card, 
            isSelected && styles.cardSelected,
            !assignedToMe && styles.cardDisabled // Darken if not assigned
        ]}
        activeOpacity={selectable ? 0.8 : 1}
        onPress={() => toggleSelection(item)}
        // Allow click even if not payer to potentially view details (if you add detail screen later)
        disabled={false} 
      >
        <View style={styles.cardHeader}>
          <View style={styles.typeRow}>
            
            {/* Checkbox: Only for Payer + Actionable Status */}
            {selectable ? (
                <View style={[styles.checkbox, isSelected && styles.checkboxChecked]}>
                    {isSelected && <Ionicons name="checkmark" size={14} color="white" />}
                </View>
            ) : (
                // Indication for Non-Payer or Completed
                <View style={styles.iconBox}>
                    <Ionicons name={typeCfg.icon} size={18} color={colors.brand} />
                </View>
            )}

            <View>
                <Text style={[styles.billNumber, !assignedToMe && {color: '#4B5563'}]}>
                    {typeCfg.label}
                </Text>
                {/* Room Info Tag */}
                <View style={styles.roomTag}>
                    <Ionicons name="business-outline" size={10} color="#6B7280" />
                    <Text style={styles.roomText}>P.{item.room_number}</Text>
                </View>
            </View>
          </View>
          
          <View style={{alignItems: 'flex-end', gap: 4}}>
            <View style={[styles.statusBadge, { backgroundColor: statusCfg.bg }]}>
                <Text style={[styles.statusText, { color: statusCfg.color }]}>
                {statusCfg.label}
                </Text>
            </View>
            {/* Not Assigned Indicator */}
            {!assignedToMe && (
                <Text style={styles.readOnlyText}>
                    <Ionicons name="lock-closed" size={10} /> Chỉ xem
                </Text>
            )}
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.row}>
            <Text style={styles.label}>Kỳ thanh toán:</Text>
            <Text style={styles.value}>
                {new Date(item.billing_period_start).toLocaleDateString('vi-VN')}
            </Text>
        </View>

        <View style={styles.row}>
            <Text style={styles.label}>Hạn chót:</Text>
            <Text style={[styles.value, item.status === 'overdue' && {color: '#DC2626', fontWeight: '700'}]}>
                {new Date(item.due_date).toLocaleDateString('vi-VN')}
            </Text>
        </View>

        <View style={styles.row}>
            <Text style={styles.label}>Tổng tiền:</Text>
            <Text style={styles.value}>{totalDue.toLocaleString('vi-VN')} đ</Text>
        </View>

        {remaining > 0 && remaining !== totalDue && (
             <View style={styles.row}>
                <Text style={styles.label}>Còn lại:</Text>
                <Text style={[styles.value, {color: colors.brand}]}>{remaining.toLocaleString('vi-VN')} đ</Text>
            </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <Header title="Hóa đơn" isHome={false} />

      <View style={styles.contentContainer}>
        
        {/* Top Info */}
        <View style={styles.topRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Danh sách hóa đơn</Text>
            <Text style={styles.subtitle}>Chọn hóa đơn để thanh toán</Text>
          </View>
          <TouchableOpacity
            style={styles.historyBadge}
            onPress={() => navigation.navigate("TransactionHistoryScreen")}
          >
            <Text style={styles.historyText}>Lịch sử GD</Text>
          </TouchableOpacity>
        </View>

        {/* 1. Status Filter */}
        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 20 }}>
            {FILTER_OPTIONS.map((option) => {
              const isActive = filterKey === option.key;
              return (
                <TouchableOpacity
                  key={option.key}
                  onPress={() => setFilterKey(option.key)}
                  style={[styles.filterChip, isActive && styles.filterChipActive]}
                >
                  <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* 2. Room Filter (Only show if > 1 room found) */}
        {uniqueRooms.length > 1 && (
            <View style={styles.roomFilterContainer}>
                <Text style={styles.roomFilterLabel}>Phòng:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <TouchableOpacity 
                        style={[styles.roomChip, selectedRoom === 'all' && styles.roomChipActive]}
                        onPress={() => setSelectedRoom('all')}
                    >
                        <Text style={[styles.roomChipText, selectedRoom === 'all' && styles.roomChipTextActive]}>Tất cả</Text>
                    </TouchableOpacity>
                    {uniqueRooms.map(room => (
                        <TouchableOpacity 
                            key={room}
                            style={[styles.roomChip, selectedRoom === room && styles.roomChipActive]}
                            onPress={() => setSelectedRoom(room)}
                        >
                            <Text style={[styles.roomChipText, selectedRoom === room && styles.roomChipTextActive]}>P.{room}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
        )}

        {/* List */}
        {loading && !refreshing ? (
          <ActivityIndicator size="large" color={colors.brand} style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={filteredBills}
            keyExtractor={(item) => item.bill_id.toString()}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 100 }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            ListEmptyComponent={
                <View style={{alignItems: 'center', marginTop: 50}}>
                    <Text style={{color: colors.muted}}>Không có hóa đơn nào.</Text>
                </View>
            }
          />
        )}
      </View>

      {/* FAB */}
      {selectedIds.length > 0 && (
        <View style={styles.fabContainer}>
            <View style={styles.totalInfo}>
                <Text style={styles.totalLabel}>Tổng thanh toán:</Text>
                <Text style={styles.totalValue}>{totalSelectedAmount.toLocaleString('vi-VN')} đ</Text>
            </View>
            <TouchableOpacity style={styles.payButton} onPress={handlePayNow}>
                <Text style={styles.payButtonText}>Thanh toán ({selectedIds.length})</Text>
                <Ionicons name="arrow-forward" size={20} color="white" />
            </TouchableOpacity>
        </View>
      )}
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
  
  topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.sm },
  title: { fontSize: 18, fontWeight: "700", color: "#111827" },
  subtitle: { fontSize: 13, color: "#6B7280", marginTop: 2 },
  historyBadge: { backgroundColor: "white", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: "#E5E7EB" },
  historyText: { fontSize: 12, color: colors.brand, fontWeight: "600" },

  // Status Filter
  filterContainer: { marginBottom: 12, height: 36 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: "white", marginRight: 8, borderWidth: 1, borderColor: "#E5E7EB", justifyContent: 'center' },
  filterChipActive: { backgroundColor: colors.brand, borderColor: colors.brand },
  filterText: { fontSize: 12, color: "#6B7280", fontWeight: "600" },
  filterTextActive: { color: "white" },

  // Room Filter
  roomFilterContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  roomFilterLabel: { fontSize: 12, color: '#6B7280', marginRight: 8 },
  roomChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, backgroundColor: '#E5E7EB', marginRight: 6 },
  roomChipActive: { backgroundColor: '#374151' },
  roomChipText: { fontSize: 11, color: '#4B5563', fontWeight: '600' },
  roomChipTextActive: { color: 'white' },

  // Cards
  card: { backgroundColor: "white", borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: 'transparent', shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  cardSelected: { borderColor: colors.brand, backgroundColor: '#EFF6FF' },
  
  // Disabled State (For Secondary Tenants)
  cardDisabled: { 
      backgroundColor: '#F9FAFB', 
      borderColor: '#E5E7EB',
      opacity: 0.9 
  },

  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 },
  typeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  checkbox: { width: 20, height: 20, borderRadius: 6, borderWidth: 1, borderColor: '#D1D5DB', alignItems: 'center', justifyContent: 'center', backgroundColor: 'white' },
  checkboxChecked: { backgroundColor: colors.brand, borderColor: colors.brand },
  iconBox: { width: 28, height: 28, borderRadius: 8, backgroundColor: "#E0F2FE", alignItems: 'center', justifyContent: 'center' },
  
  billNumber: { fontSize: 15, fontWeight: "700", color: "#111827" },
  roomTag: { flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 2 },
  roomText: { fontSize: 11, color: '#6B7280', fontWeight: '500' },

  statusBadge: { paddingHorizontal: 6, paddingVertical: 4, borderRadius: 6 },
  statusText: { fontSize: 11, fontWeight: "700" },
  readOnlyText: { fontSize: 10, color: '#6B7280', fontStyle: 'italic' },

  divider: { height: 1, backgroundColor: "#E5E7EB", marginVertical: 8 },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  label: { fontSize: 13, color: "#6B7280" },
  value: { fontSize: 13, fontWeight: "500", color: "#111827" },
  
  fabContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: "white", paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: 30, borderTopLeftRadius: 24, borderTopRightRadius: 24, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 10, elevation: 10, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  totalInfo: { flex: 1 },
  totalLabel: { fontSize: 12, color: '#6B7280' },
  totalValue: { fontSize: 18, fontWeight: '700', color: colors.brand },
  payButton: { backgroundColor: colors.brand, flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12 },
  payButtonText: { color: 'white', fontWeight: '700', fontSize: 15 }
});
