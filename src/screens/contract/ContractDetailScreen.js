import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import Header from "../../components/Header";
import { spacing } from "../../theme/spacing";
import { colors } from "../../theme/colors";
import { 
  getContractDetail, 
  downloadContractToCache, 
  saveContractToDevice, 
} from "../../service/api/contract";

const STATUS_CONFIG = {
  active: { label: "Đang hiệu lực", color: "#16A34A", bg: "#DCFCE7" },
  expired: { label: "Hết hạn", color: "#DC2626", bg: "#FEE2E2" },
  pending: { label: "Chờ kích hoạt", color: "#D97706", bg: "#FEF3C7" },
  cancelled: { label: "Đã hủy", color: "#6B7280", bg: "#F3F4F6" },
  terminated: { label: "Đã chấm dứt", color: "#EF4444", bg: "#FEE2E2" },
};

export default function ContractDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { contractId } = route.params;

  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetchDetail();
  }, [contractId]);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const res = await getContractDetail(contractId);
      setContract(res?.data || res);
    } catch (err) {
      Alert.alert("Lỗi", "Không thể tải chi tiết hợp đồng.");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPress = async () => {
    Alert.alert(
      "Tải Hợp Đồng",
      "Bạn muốn làm gì với file này?",
      [
        {
          text: "Hủy",
          style: "cancel"
        },
        {
          text: "Chia sẻ",
          onPress: () => processDownload("share")
        },
        {
          text: "Lưu vào máy",
          onPress: () => processDownload("save")
        }
      ]
    );
  };

  const processDownload = async (action) => {
    if (downloading) return;
    setDownloading(true);

    try {
      const fileName = contract.file_name || `hop-dong-${contractId}.pdf`;

      // 1. Always download to cache first
      const uri = await downloadContractToCache(contractId, fileName);

      // 2. Perform requested action
      if (action === "save") {
        await saveContractToDevice(uri, fileName);
      } else {
        await shareContractFile(uri);
      }

    } catch (err) {
      Alert.alert("Lỗi", err.message || "Không thể tải file.");
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Header title="Chi tiết hợp đồng" isHome={false} />
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={colors.brand} />
        </View>
      </View>
    );
  }

  if (!contract) return null;

  const status = STATUS_CONFIG[contract.status] || STATUS_CONFIG.active;
  const formatDate = (d) => d ? new Date(d).toLocaleDateString("vi-VN") : "---";
  const formatMoney = (v) => Number(v || 0).toLocaleString("vi-VN") + " đ";
    console.log("Contract Note:", contract?.note);
  return (
    <View style={styles.container}>
      <Header title={`Hợp đồng #${contractId}`} isHome={false} />

      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* Status Card */}
        <View style={styles.card}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Text style={styles.label}>Trạng thái</Text>
              <View style={[styles.statusBadge, { backgroundColor: status.bg, marginTop: 4 }]}>
                <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
              </View>
            </View>
            {contract.has_file && (
              <TouchableOpacity
                style={styles.downloadBtn}
                onPress={handleDownloadPress}
                disabled={downloading}
              >
                {downloading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <>
                    <Ionicons name="cloud-download-outline" size={20} color="white" />
                    <Text style={styles.downloadText}>Tải PDF</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Main Info */}
        <View style={styles.card}>
            <Text style={styles.sectionTitle}>Thông tin chính</Text>
            
            <InfoRow label="Phòng" value={contract.room_number || `ID: ${contract.room_id}`} />
            <InfoRow label="Tòa nhà" value={contract.rooms?.buildings?.name} />
            <View style={styles.divider} />
            <InfoRow label="Ngày bắt đầu" value={formatDate(contract.start_date)} />
            <InfoRow label="Ngày kết thúc" value={formatDate(contract.end_date)} />
            <View style={styles.divider} />
            <InfoRow label="Tiền thuê" value={formatMoney(contract.rent_amount)} highlight />
            <InfoRow label="Tiền cọc" value={formatMoney(contract.deposit_amount)} />
            <View style={styles.divider} />

            {/* --- BỔ SUNG 1: CHU KỲ THANH TOÁN --- */}
            <View style={styles.row}>
                <Text style={styles.label}>Chu kỳ thanh toán:</Text>
                <Text style={styles.value}>
                    {contract.payment_cycle_months
                        ? `${contract.payment_cycle_months} tháng/lần`
                        : '1 tháng/lần'}
                </Text>
            </View>

            {/* --- BỔ SUNG 2: THÔNG TIN PHẠT & LÃI SUẤT --- */}
            {contract.penalty_rate > 0 && (
                <View style={styles.row}>
                    <Text style={styles.label}>Phạt chậm trả:</Text>
                    <Text style={[styles.value, { color: '#DC2626', fontSize: 14 }]}>
                        {contract.penalty_rate}% / ngày
                    </Text>
                </View>
            )}

            {/* --- BỔ SUNG 3: THÔNG TIN NGƯỜI THUÊ (Xác thực) --- */}
            <View style={styles.divider} />
            <Text style={{fontSize: 14, fontWeight: 'bold', marginBottom: 8, color: '#4B5563'}}>Người đứng tên:</Text>
            <View style={styles.row}>
                <Text style={styles.label}>Họ tên:</Text>
                <Text style={styles.value}>{contract.tenant_name || contract.tenant?.user?.full_name}</Text>
            </View>
            <View style={styles.row}>
                <Text style={styles.label}>CMND/CCCD:</Text>
                <Text style={styles.value}>{contract.id_number || contract.tenant?.id_number || '---'}</Text>
            </View>
        </View>

        {/* Addendums List */}
        {contract.contract_addendums && contract.contract_addendums.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Phụ lục hợp đồng ({contract.contract_addendums.length})</Text>

            {contract.contract_addendums.map((addendum, index) => (
              <View key={addendum.addendum_id} style={[styles.addendumItem, index !== 0 && { borderTopWidth: 1, borderTopColor: '#F3F4F6' }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={styles.addendumTitle}>
                    Phụ lục #{addendum.addendum_id} ({addendum.type})
                  </Text>
                  <Text style={styles.addendumDate}>{formatDate(addendum.created_at)}</Text>
                </View>
                <Text style={styles.addendumSummary}>{addendum.summary || "Không có mô tả"}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Note */}
          {contract.note && (
              <>
                  <View style={styles.divider} />
                  <Text style={{fontSize: 14, fontWeight: 'bold', marginBottom: 8, color: '#D97706'}}>Ghi chú:</Text>
                  <Text style={{fontSize: 14, color: '#111827', fontStyle: 'italic', lineHeight: 20}}>
                      {contract.note}
                  </Text>
              </>
          )}

      </ScrollView>
    </View>
  );
}

const InfoRow = ({ label, value, highlight }) => (
  <View style={styles.row}>
    <Text style={styles.label}>{label}</Text>
    <Text style={[styles.value, highlight && { color: colors.brand, fontWeight: '700' }]}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.brand },
  scrollContent: {
    backgroundColor: "#F3F4F6",
    minHeight: '100%',
    marginTop: -24,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xl + 24,
    paddingBottom: 40
  },
  centerBox: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  sectionTitle: {
    fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 12
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: { fontSize: 13, fontWeight: "700" },
  downloadBtn: {
    flexDirection: 'row',
    backgroundColor: colors.brand,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    gap: 6
  },
  downloadText: { color: 'white', fontWeight: '600', fontSize: 14 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  label: { fontSize: 14, color: "#6B7280" },
  value: { fontSize: 14, fontWeight: "500", color: "#111827" },
  divider: { height: 1, backgroundColor: "#E5E7EB", marginVertical: 8 },
  addendumItem: { paddingVertical: 12 },
  addendumTitle: { fontSize: 14, fontWeight: '600', color: '#374151' },
  addendumDate: { fontSize: 12, color: '#9CA3AF' },
  addendumSummary: { fontSize: 13, color: '#6B7280', marginTop: 4 },
  noteText: { fontSize: 14, color: '#4B5563', lineHeight: 20 }
});
