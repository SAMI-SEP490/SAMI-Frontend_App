import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  Image // <--- 1. Import Image
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import * as WebBrowser from "expo-web-browser";
import { Ionicons } from "@expo/vector-icons";

import Header from "../../components/Header";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
import { createPayOSLink } from "../../service/api/payment";

export default function OnlinePaymentScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { bills } = route.params; 

  const [loading, setLoading] = useState(false);

  const totalPayment = useMemo(() => {
    return bills.reduce((sum, b) => {
        const total = Number(b.total_amount || 0) + Number(b.penalty_amount || 0);
        const paid = Number(b.paid_amount || 0);
        return sum + (total - paid);
    }, 0);
  }, [bills]);

  const handlePayOS = async () => {
    try {
      setLoading(true);
      const billIds = bills.map(b => b.bill_id);
      
      const res = await createPayOSLink(billIds);
      const checkoutUrl = res?.data?.checkoutUrl;

      if (!checkoutUrl) throw new Error("Không lấy được link thanh toán.");

      await WebBrowser.openBrowserAsync(checkoutUrl);
      
      Alert.alert(
          "Kết quả giao dịch", 
          "Vui lòng kiểm tra lại trạng thái hóa đơn sau giây lát.",
          [{ text: "OK", onPress: () => navigation.navigate("BillListScreen") }]
      );

    } catch (error) {
      Alert.alert("Lỗi", error.message || "Không thể tạo giao dịch.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Thanh toán Online" isHome={false} />

      <View style={styles.contentContainer}>
        <ScrollView showsVerticalScrollIndicator={false}>
            
            {/* Summary Card */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Xác nhận thanh toán</Text>
                <View style={styles.divider} />
                
                {bills.map((bill) => (
                    <View key={bill.bill_id} style={styles.itemRow}>
                        <Text style={styles.itemLabel}>
                            {bill.bill_type === 'monthly_rent' ? 'Tiền thuê' : 'Điện nước'} - {bill.bill_number.slice(-4)}
                        </Text>
                        <Text style={styles.itemValue}>
                            {(Number(bill.total_amount) + Number(bill.penalty_amount||0) - Number(bill.paid_amount||0)).toLocaleString('vi-VN')} đ
                        </Text>
                    </View>
                ))}
                
                <View style={[styles.divider, { marginVertical: 12 }]} />
                
                <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Tổng cộng:</Text>
                    <Text style={styles.totalValue}>{totalPayment.toLocaleString('vi-VN')} đ</Text>
                </View>
            </View>

            {/* Payment Method */}
            <Text style={styles.sectionHeader}>Phương thức thanh toán</Text>
            
            <TouchableOpacity 
                style={styles.methodCard} 
                onPress={handlePayOS}
                disabled={loading}
            >
                <View style={{flexDirection: 'row', alignItems: 'center', gap: 12}}>
                    {/* LOGO IMAGE */}
                    <View style={styles.logoBox}>
                        <Image 
                            source={{ uri: "https://about.cas.so/wp-content/uploads/sites/11/2023/08/cropped-Untitled-1.png" }}
                            style={styles.logoImage}
                            resizeMode="contain"
                        />
                    </View>
                    <View>
                        <Text style={styles.methodTitle}>Cổng thanh toán PayOS</Text>
                        <Text style={styles.methodDesc}>QR Code / Thẻ ATM / Visa</Text>
                    </View>
                </View>
                {loading ? <ActivityIndicator color={colors.brand} /> : <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />}
            </TouchableOpacity>

        </ScrollView>
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
    padding: 20,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  cardTitle: { fontSize: 16, fontWeight: "700", color: "#111827", marginBottom: 8 },
  divider: { height: 1, backgroundColor: "#E5E7EB", marginVertical: 8 },
  itemRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  itemLabel: { fontSize: 14, color: "#6B7280" },
  itemValue: { fontSize: 14, fontWeight: "500", color: "#111827" },
  totalRow: { flexDirection: "row", justifyContent: "space-between", alignItems: 'center' },
  totalLabel: { fontSize: 16, fontWeight: "600", color: "#111827" },
  totalValue: { fontSize: 20, fontWeight: "700", color: colors.brand },
  
  sectionHeader: { fontSize: 14, fontWeight: "600", color: "#6B7280", marginBottom: 12, marginLeft: 4 },
  methodCard: {
      backgroundColor: "white",
      borderRadius: 16,
      padding: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderWidth: 1,
      borderColor: '#E5E7EB'
  },
  logoBox: {
      width: 48, 
      height: 48, 
      borderRadius: 12, 
      backgroundColor: 'white', // White bg for logo
      alignItems: 'center', 
      justifyContent: 'center', 
      borderWidth: 1, 
      borderColor: '#E5E7EB'
  },
  logoImage: {
      width: 36,
      height: 36
  },
  methodTitle: { fontSize: 15, fontWeight: "700", color: "#111827" },
  methodDesc: { fontSize: 13, color: "#6B7280", marginTop: 2 }
});
