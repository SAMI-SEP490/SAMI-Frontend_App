import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Alert, Modal, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import Checkbox from 'expo-checkbox';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as Sharing from 'expo-sharing';
import { useSafeAreaInsets } from 'react-native-safe-area-context'; // [FIX] Import SafeArea
import { Ionicons } from '@expo/vector-icons'; // Import Icon

import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { logout } from '../../auth';

import {
    getContractDetail,
    approveContract,
    respondToTermination,
    downloadContractToCache,
    getContracts
} from '../../service/api/contract';
import { getActiveConsentVersion } from '../../service/api/consent';

const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return '0';
    return new Intl.NumberFormat('vi-VN').format(amount);
};
const formatDate = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '—';
    return date.toLocaleDateString('vi-VN');
};

export default function ContractActionScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const insets = useSafeAreaInsets(); // [FIX] Lấy insets an toàn
    const { contractId } = route.params || {};

    // ... State giữ nguyên ...
    const [contract, setContract] = useState(null);
    const [termsContent, setTermsContent] = useState(null);
    const [privacyContent, setPrivacyContent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [error, setError] = useState(null);
    const [isTermsChecked, setIsTermsChecked] = useState(false);
    const [isPrivacyChecked, setIsPrivacyChecked] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalContent, setModalContent] = useState({ title: '', content: '' });

    // ... useEffect & loadData giữ nguyên ...
    useEffect(() => {
        if (!contractId) { setError("Không tìm thấy ID hợp đồng."); setLoading(false); return; }
        loadData();
    }, [contractId]);

    const loadData = async () => {
        try {
            setLoading(true); setError(null);
            const response = await getContractDetail(contractId);
            const contractData = response.data || response;
            if (!contractData || !contractData.contract_id) throw new Error("Dữ liệu không hợp lệ.");
            setContract(contractData);

            if (contractData.status === 'pending') {
                try {
                    const [termsRes, privacyRes] = await Promise.all([
                        getActiveConsentVersion('TERM_OF_SERVICE'),
                        getActiveConsentVersion('PRIVACY_POLICY')
                    ]);
                    setTermsContent(termsRes?.data || termsRes);
                    setPrivacyContent(privacyRes?.data || privacyRes);
                } catch (err) { console.warn("Lỗi consent:", err); }
            }
        } catch (error) {
            setError(error.message || "Lỗi mạng");
        } finally {
            setLoading(false);
        }
    };

    const isNewContract = contract?.status === 'pending';
    const isTerminationRequest = contract?.status === 'requested_termination';

    // ... Các hàm xử lý (handleViewPdf, handleConfirm, handleReject) giữ nguyên logic ...
    const openDoc = (title, contentObj) => {
        setModalContent({ title, content: contentObj?.content || "Đang cập nhật..." });
        setModalVisible(true);
    };

    const handleViewPdf = async () => {
        if (!contract) return;
        try {
            setDownloading(true);
            const fileName = `HopDong_${contract.contract_number || contractId}.pdf`;
            const fileInfo = await downloadContractToCache(contractId, fileName);
            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(fileInfo.uri, { mimeType: fileInfo.mimeType || 'application/pdf', dialogTitle: 'Xem hợp đồng' });
            } else { Alert.alert("Lỗi", "Thiết bị không hỗ trợ xem file."); }
        } catch (error) { Alert.alert("Lỗi tải file", error.message); } finally { setDownloading(false); }
    };

    const handleConfirm = async () => {
        if (!contract) return;
        if (isNewContract && (!isTermsChecked || !isPrivacyChecked)) {
            Alert.alert("Yêu cầu", "Vui lòng đồng ý điều khoản."); return;
        }
        try {
            setSubmitting(true);
            if (isNewContract) {
                await approveContract(contractId, 'accept');
                Alert.alert("Thành công", "Đã chấp nhận hợp đồng!", [{ text: "Về trang chủ", onPress: () => navigation.navigate("DashboardScreen") }]);
            } else if (isTerminationRequest) {
                await respondToTermination(contractId, 'approve');
                Alert.alert("Đã xác nhận", "Đã đồng ý chấm dứt.", [{ text: "OK", onPress: () => navigation.navigate("DashboardScreen") }]);
            }
        } catch (error) { Alert.alert("Lỗi", error.message); } finally { setSubmitting(false); }
    };

    const handleReject = () => {
        if (!contract) return;
        if (isNewContract) {
            Alert.alert("Cảnh báo", "Từ chối hợp đồng này?", [
                { text: "Hủy", style: "cancel" },
                {
                    text: "Từ chối", style: "destructive", onPress: async () => {
                        try {
                            setSubmitting(true);
                            await approveContract(contractId, 'reject', 'User rejected');
                            const res = await getContracts({ status: 'active' });
                            const activeContracts = res.data || res;
                            if (activeContracts?.length > 0) {
                                Alert.alert("Đã từ chối", "Quay về trang chủ.", [{ text: "OK", onPress: () => navigation.navigate("DashboardScreen") }]);
                            } else {
                                Alert.alert("Thông báo", "Hệ thống sẽ đăng xuất.", [{ text: "OK", onPress: async () => await logout() }]);
                            }
                        } catch (e) { Alert.alert("Lỗi", e.message); } finally { setSubmitting(false); }
                    }
                }
            ]);
        } else if (isTerminationRequest) {
            Alert.alert("Xác nhận", "Từ chối chấm dứt hợp đồng?", [
                { text: "Hủy", style: "cancel" },
                {
                    text: "Từ chối", onPress: async () => {
                        try { setSubmitting(true); await respondToTermination(contractId, 'reject'); if (navigation.canGoBack()) {
                            navigation.goBack();
                        } else {
                            navigation.navigate("DashboardScreen");
                        } }
                        catch (error) { Alert.alert("Lỗi", error.message); } finally { setSubmitting(false); }
                    }
                }
            ]);
        }
    };

    if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={colors.brand} /></View>;
    if (error || !contract) return (
        <View style={styles.center}>
            <Text style={{ color: 'red', marginBottom: 16 }}>{error || "Lỗi dữ liệu"}</Text>
            <TouchableOpacity onPress={loadData} style={styles.retryBtn}><Text style={{ color: 'white' }}>Thử lại</Text></TouchableOpacity>
        </View>
    );

    return (
        // [FIX] Thêm paddingBottom bằng insets.bottom để tránh footer bị đè
        <View style={[styles.container, { paddingBottom: insets.bottom }]}>

            {/* Header giả lập nếu chưa có component Header chuẩn */}
            <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <Text style={styles.headerTitle}>
                    {isNewContract ? "Ký Hợp Đồng" : (isTerminationRequest ? "Xác Nhận Hủy" : "Chi Tiết")}
                </Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* --- CARD CHÍNH --- */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Ionicons name="document-text-outline" size={24} color={colors.brand} />
                        <Text style={styles.contractNumber}>HĐ: {contract.contract_number}</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Text style={styles.label}>📍 Phòng/Tòa:</Text>
                        <Text style={styles.value}>{contract.room_number} - {contract.building_name}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.label}>📅 Thời hạn:</Text>
                        <Text style={styles.value}>{contract.duration_months} tháng ({formatDate(contract.start_date)} - {formatDate(contract.end_date)})</Text>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.moneyRow}>
                        <Text style={styles.label}>💰 Tiền thuê:</Text>
                        <Text style={styles.moneyValue}>{formatCurrency(contract.rent_amount)} đ</Text>
                    </View>
                    <View style={styles.moneyRow}>
                        <Text style={styles.label}>💸 Cọc:</Text>
                        <Text style={styles.value}>{formatCurrency(contract.deposit_amount)} đ</Text>
                    </View>
                    <View style={styles.moneyRow}>
                        <Text style={styles.label}>🔄 Chu kỳ:</Text>
                        <Text style={styles.value}>{contract.payment_cycle_months || 1} tháng/lần</Text>
                    </View>

                    {/* PDF Button */}
                    <TouchableOpacity style={styles.pdfButton} onPress={handleViewPdf} disabled={downloading}>
                        {downloading ? <ActivityIndicator color={colors.brand} /> : (
                            <>
                                <Ionicons name="cloud-download-outline" size={20} color={colors.brand} />
                                <Text style={styles.pdfText}>Tải & Xem Hợp Đồng PDF</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>

                {/* --- CARD PHỤ (Thông tin cá nhân) --- */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Thông tin người thuê</Text>
                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Họ tên:</Text>
                        <Text style={styles.value}>{contract.tenant_name || contract.tenant?.user?.full_name}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.label}>CMND/CCCD:</Text>
                        <Text style={styles.value}>{contract.id_number || contract.tenant?.id_number || '---'}</Text>
                    </View>
                </View>

                {/* --- CHECKBOX --- */}
                {isNewContract && (
                    <View style={styles.consentBox}>
                        <TouchableOpacity style={styles.checkRow} onPress={() => setIsTermsChecked(!isTermsChecked)}>
                            <Checkbox value={isTermsChecked} onValueChange={setIsTermsChecked} color={isTermsChecked ? colors.brand : undefined} />
                            <Text style={styles.checkText}>Đồng ý với <Text style={styles.link} onPress={() => openDoc('Điều khoản', termsContent)}>Điều khoản sử dụng</Text></Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.checkRow} onPress={() => setIsPrivacyChecked(!isPrivacyChecked)}>
                            <Checkbox value={isPrivacyChecked} onValueChange={setIsPrivacyChecked} color={isPrivacyChecked ? colors.brand : undefined} />
                            <Text style={styles.checkText}>Đồng ý với <Text style={styles.link} onPress={() => openDoc('Bảo mật', privacyContent)}>Chính sách bảo mật</Text></Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* --- WARNING --- */}
                {isTerminationRequest && (
                    <View style={styles.warningBox}>
                        <Ionicons name="alert-circle" size={24} color="#DC2626" />
                        <View style={{ flex: 1 }}>
                            <Text style={styles.warningTitle}>Yêu cầu chấm dứt</Text>
                            <Text style={styles.warningText}>Bạn đang xác nhận chấm dứt hợp đồng trước hạn.</Text>
                        </View>
                    </View>
                )}

            </ScrollView>

            {/* --- FOOTER FIXED --- */}
            <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom + 10, 20) }]}>
                <TouchableOpacity style={[styles.actionBtn, styles.btnReject]} onPress={handleReject} disabled={submitting}>
                    <Text style={styles.textReject}>{isNewContract ? "Từ chối" : "Giữ HĐ"}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.actionBtn, styles.btnConfirm, (isNewContract && (!isTermsChecked || !isPrivacyChecked)) && styles.btnDisabled]}
                    onPress={handleConfirm}
                    disabled={(isNewContract && (!isTermsChecked || !isPrivacyChecked)) || submitting}
                >
                    {submitting ? <ActivityIndicator color="white" /> : <Text style={styles.textConfirm}>{isNewContract ? "Ký Hợp Đồng" : "Đồng Ý Hủy"}</Text>}
                </TouchableOpacity>
            </View>

            {/* MODAL */}
            <Modal animationType="fade" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
                <View style={styles.modalBg}>
                    <View style={styles.modalCard}>
                        <Text style={styles.modalHeader}>{modalContent.title}</Text>
                        <ScrollView style={{ maxHeight: 300 }}><Text style={styles.modalText}>{modalContent.content}</Text></ScrollView>
                        <TouchableOpacity style={styles.modalClose} onPress={() => setModalVisible(false)}><Text style={{ color: 'white', fontWeight: 'bold' }}>Đóng</Text></TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    header: { backgroundColor: 'white', paddingBottom: 16, paddingHorizontal: 20, borderBottomWidth: 1, borderColor: '#E5E7EB' },
    headerTitle: { fontSize: 20, fontWeight: '700', color: '#111827', textAlign: 'center' },

    scrollContent: { padding: 16, paddingBottom: 120 }, // Padding bottom lớn để không bị footer che

    // Card Style
    card: { backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, paddingBottom: 12, borderBottomWidth: 1, borderColor: '#F3F4F6' },
    contractNumber: { fontSize: 16, fontWeight: '700', marginLeft: 8, color: '#374151' },
    sectionTitle: { fontSize: 14, fontWeight: '700', color: '#6B7280', marginBottom: 12, textTransform: 'uppercase' },

    // Info Rows
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    moneyRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, alignItems: 'center' },
    label: { color: '#6B7280', fontSize: 14 },
    value: { color: '#1F2937', fontSize: 14, fontWeight: '500', flex: 1, textAlign: 'right' },
    moneyValue: { color: colors.brand, fontSize: 16, fontWeight: '700' },
    divider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 12 },

    // PDF Button
    pdfButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#EFF6FF', padding: 12, borderRadius: 8, marginTop: 8, borderWidth: 1, borderColor: '#BFDBFE', borderStyle: 'dashed' },
    pdfText: { color: colors.brand, fontWeight: '600', marginLeft: 8 },

    // Consent
    consentBox: { marginBottom: 16 },
    checkRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    checkText: { marginLeft: 10, fontSize: 14, color: '#4B5563' },
    link: { color: colors.brand, fontWeight: '600', textDecorationLine: 'underline' },

    // Warning
    warningBox: { flexDirection: 'row', backgroundColor: '#FEF2F2', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#FECACA', gap: 10 },
    warningTitle: { color: '#B91C1C', fontWeight: '700', marginBottom: 2 },
    warningText: { color: '#991B1B', fontSize: 13 },

    // Footer Fixed
    footer: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        backgroundColor: 'white',
        paddingTop: 16, paddingHorizontal: 16,
        flexDirection: 'row', gap: 12,
        borderTopWidth: 1, borderColor: '#E5E7EB',
        shadowColor: '#000', shadowOffset: { height: -2 }, shadowOpacity: 0.05, elevation: 10
    },
    actionBtn: { flex: 1, paddingVertical: 14, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    btnReject: { backgroundColor: '#FEE2E2' },
    textReject: { color: '#DC2626', fontWeight: '700' },
    btnConfirm: { backgroundColor: colors.brand },
    textConfirm: { color: 'white', fontWeight: '700' },
    btnDisabled: { opacity: 0.5, backgroundColor: '#9CA3AF' },

    // Modal
    modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
    modalCard: { backgroundColor: 'white', borderRadius: 12, padding: 20 },
    modalHeader: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
    modalText: { lineHeight: 22, color: '#374151' },
    modalClose: { marginTop: 16, backgroundColor: '#374151', padding: 12, borderRadius: 8, alignItems: 'center' },

    retryBtn: { marginTop: 12, backgroundColor: colors.brand, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 }
});
