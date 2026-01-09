import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import Header from "../../components/Header";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
import { getPaymentHistory } from "../../service/api/payment";

export default function TransactionHistoryScreen() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // State for expanding list items
  const [expandedId, setExpandedId] = useState(null);

  const fetchHistory = async () => {
    try {
      if (!refreshing) setLoading(true);
      const res = await getPaymentHistory();
      setTransactions(res?.data || []);
    } catch (error) {
      console.error("History error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchHistory();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchHistory();
  };

  const renderItem = ({ item }) => {
    const isExpanded = expandedId === item.payment_id;
    const isFailed = item.status === 'failed' || item.status === 'refunded';
    
    return (
      <View style={styles.card}>
        <TouchableOpacity 
            style={styles.cardHeader} 
            activeOpacity={0.7}
            onPress={() => setExpandedId(isExpanded ? null : item.payment_id)}
        >
            <View style={{flexDirection: 'row', gap: 12, alignItems: 'center'}}>
                <View style={[styles.iconBox, isFailed && {backgroundColor: '#FEE2E2'}]}>
                    <Ionicons 
                        name={isFailed ? "close" : "checkmark"} 
                        size={18} 
                        color={isFailed ? "#EF4444" : "#16A34A"} 
                    />
                </View>
                <View>
                    <Text style={styles.amount}>
                        {isFailed ? "Thất bại" : `${Number(item.amount).toLocaleString('vi-VN')} đ`}
                    </Text>
                    <Text style={styles.date}>
                        {new Date(item.payment_date).toLocaleString('vi-VN')}
                    </Text>
                </View>
            </View>
            <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={20} color="#9CA3AF" />
        </TouchableOpacity>

        {isExpanded && (
            <View style={styles.cardBody}>
                <View style={styles.divider} />
                <View style={styles.row}>
                    <Text style={styles.label}>Mã giao dịch:</Text>
                    <Text style={styles.value}>{item.reference || item.payment_id}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Phương thức:</Text>
                    <Text style={styles.value}>
                        {item.method === 'online' ? item.online_type : 'Tiền mặt'}
                    </Text>
                </View>
                
                {/* List Bills Paid in this Transaction */}
                <Text style={styles.subHeader}>Chi tiết hóa đơn:</Text>
                {item.payment_details?.map((detail, idx) => (
                    <View key={idx} style={styles.detailRow}>
                        <Text style={styles.detailText}>
                            • {detail.bill?.bill_number}
                        </Text>
                        <Text style={styles.detailAmount}>
                            {Number(detail.amount).toLocaleString('vi-VN')} đ
                        </Text>
                    </View>
                ))}
            </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Header title="Lịch sử giao dịch" isHome={false} />

      <View style={styles.contentContainer}>
        {loading && !refreshing ? (
          <ActivityIndicator size="large" color={colors.brand} style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={transactions}
            keyExtractor={(item) => item.payment_id.toString()}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 40 }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            ListEmptyComponent={
                <View style={{alignItems: 'center', marginTop: 50}}>
                    <Text style={{color: colors.muted}}>Chưa có giao dịch nào.</Text>
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
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    overflow: 'hidden'
  },
  cardHeader: {
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      padding: 16
  },
  iconBox: {
      width: 36, height: 36, borderRadius: 18, backgroundColor: '#DCFCE7',
      alignItems: 'center', justifyContent: 'center'
  },
  amount: { fontSize: 15, fontWeight: '700', color: '#111827' },
  date: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  cardBody: {
      padding: 16,
      paddingTop: 0,
      backgroundColor: '#FAFAFA'
  },
  divider: { height: 1, backgroundColor: "#E5E7EB", marginBottom: 12 },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  label: { fontSize: 13, color: "#6B7280" },
  value: { fontSize: 13, fontWeight: "500", color: "#111827" },
  subHeader: { fontSize: 13, fontWeight: '600', color: colors.brand, marginTop: 8, marginBottom: 4 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4, paddingLeft: 8 },
  detailText: { fontSize: 13, color: '#4B5563' },
  detailAmount: { fontSize: 13, fontWeight: '500', color: '#111827' }
});
