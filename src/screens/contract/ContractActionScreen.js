import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Alert, Modal, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import Checkbox from 'expo-checkbox';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as Sharing from 'expo-sharing';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { logout } from '../../auth';
// Import API
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
    return amount.toLocaleString('vi-VN');
};
const formatDate = (dateString) => {
    if (!dateString) return 'Chưa xác định';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return date.toLocaleDateString('vi-VN');
};

export default function ContractActionScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { contractId } = route.params || {};

    const [contract, setContract] = useState(null);
    const [termsContent, setTermsContent] = useState(null);
    const [privacyContent, setPrivacyContent] = useState(null);

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [downloading, setDownloading] = useState(false); // <--- [MỚI] State loading cho nút PDF
    const [error, setError] = useState(null);
    const [isTermsChecked, setIsTermsChecked] = useState(false);
    const [isPrivacyChecked, setIsPrivacyChecked] = useState(false);

    const [modalVisible, setModalVisible] = useState(false);
    const [modalContent, setModalContent] = useState({ title: '', content: '' });

    // ... (Giữ nguyên useEffect và loadData) ...
    useEffect(() => {
        if (!contractId) {
            setError("Không tìm thấy ID hợp đồng.");
            setLoading(false);
            return;
        }
        loadData();
    }, [contractId]);

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await getContractDetail(contractId);
            const contractData = response.data || response;

            if (!contractData || !contractData.contract_id) {
                throw new Error("Dữ liệu hợp đồng không hợp lệ.");
            }
            console.log("Contract Data Loaded:", contractData);
            setContract(contractData);

            if (contractData.status === 'pending') {
                try {
                    const [termsRes, privacyRes] = await Promise.all([
                        getActiveConsentVersion('TERM_OF_SERVICE'),
                        getActiveConsentVersion('PRIVACY_POLICY')
                    ]);
                    setTermsContent(termsRes?.data || termsRes);
                    setPrivacyContent(privacyRes?.data || privacyRes);
                } catch (consentErr) {
                    console.warn("Lỗi tải điều khoản:", consentErr);
                }
            }
        } catch (error) {
            console.error("Lỗi tải trang hợp đồng:", error);
            setError("Không thể tải thông tin hợp đồng: " + (error.message || "Lỗi mạng"));
        } finally {
            setLoading(false);
        }
    };

    const isNewContract = contract?.status === 'pending';
    const isTerminationRequest = contract?.status === 'requested_termination';

    const getHeaderTitle = () => {
        if (!contract) return "Đang tải...";
        if (isNewContract) return "Chấp nhận Hợp Đồng Thuê";
        if (isTerminationRequest) return "Xác Nhận Chấm Dứt";
        return "Thông Tin Hợp Đồng";
    };

    const openDoc = (title, contentObj) => {
        setModalContent({
            title: title,
            content: contentObj?.content || "Nội dung đang được cập nhật..."
        });
        setModalVisible(true);
    };

    // --- [MỚI] Hàm xử lý xem PDF ---
    const handleViewPdf = async () => {
        if (!contract) return;
        try {
            setDownloading(true);
            // Tạo tên file gợi nhớ
            const fileName = `HopDong_${contract.contract_number || contractId}.pdf`;

            // 1. Tải về cache
            const fileInfo = await downloadContractToCache(contractId, fileName);

            // 2. Mở bằng trình xem mặc định của máy (Share sheet)
            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(fileInfo.uri, {
                    mimeType: fileInfo.mimeType || 'application/pdf',
                    dialogTitle: 'Xem hợp đồng'
                });
            } else {
                Alert.alert("Lỗi", "Thiết bị không hỗ trợ tính năng chia sẻ/xem file.");
            }
        } catch (error) {
            console.error(error);
            Alert.alert("Lỗi tải file", "Không thể tải hợp đồng: " + error.message);
        } finally {
            setDownloading(false);
        }
    };
    // -------------------------------

    // ... (Giữ nguyên handleConfirm và handleReject) ...
    const handleConfirm = async () => {
        if (!contract) return;
        if (isNewContract && (!isTermsChecked || !isPrivacyChecked)) {
            Alert.alert("Yêu cầu", "Vui lòng đọc và đồng ý với các điều khoản trước khi chấp nhận.");
            return;
        }
        try {
            setSubmitting(true);
            if (isNewContract) {
                await approveContract(contractId, 'accept');
                Alert.alert("Thành công", "Bạn đã chấp nhận hợp đồng thành công!", [
                    { text: "Về trang chủ", onPress: () => navigation.navigate("DashboardScreen") }
                ]);
            } else if (isTerminationRequest) {
                await respondToTermination(contractId, 'approve');
                Alert.alert("Đã xác nhận", "Bạn đã đồng ý chấm dứt hợp đồng.", [
                    { text: "OK", onPress: () => navigation.navigate("DashboardScreen") }
                ]);
            }
        } catch (error) {
            Alert.alert("Lỗi xử lý", error.message || "Không thể thực hiện yêu cầu.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleReject = () => {
        if (!contract) return;

        // --- LOGIC CHO HỢP ĐỒNG MỚI (PENDING) ---
        if (isNewContract) {
            Alert.alert(
                "Cảnh báo",
                "Bạn có chắc chắn muốn từ chối hợp đồng này không?",
                [
                    { text: "Xem lại", style: "cancel" },
                    {
                        text: "Xác nhận Từ chối",
                        style: "destructive",
                        onPress: async () => {
                            try {
                                setSubmitting(true);
                                // 1. Gọi API từ chối
                                await approveContract(contractId, 'reject', 'User rejected manually');

                                // 2. [MỚI] Kiểm tra xem còn hợp đồng Active nào không
                                // Gọi API lấy danh sách hợp đồng của user hiện tại
                                const res = await getContracts({ status: 'active' });
                                const activeContracts = res.data || res; // Tùy cấu trúc trả về của API getContracts

                                // 3. Xử lý điều hướng dựa trên kết quả
                                if (activeContracts && activeContracts.length > 0) {
                                    // Vẫn còn hợp đồng Active khác -> Cho vào Dashboard
                                    Alert.alert("Đã từ chối", "Bạn đã từ chối hợp đồng này. Hệ thống sẽ chuyển về trang chủ.", [
                                        { text: "Về trang chủ", onPress: () => navigation.navigate("DashboardScreen") }
                                    ]);
                                } else {
                                    // Không còn hợp đồng Active nào -> Logout
                                    Alert.alert("Thông báo", "Bạn chưa có hợp đồng hiệu lực nào. Hệ thống sẽ đăng xuất.", [
                                        {
                                            text: "Đăng xuất",
                                            onPress: async () => {
                                                await logout();
                                                // Đảm bảo navigation về màn hình Login nếu logout() không tự redirect
                                                // navigation.replace("LoginScreen");
                                            }
                                        }
                                    ]);
                                }
                            } catch (e) {
                                Alert.alert("Lỗi", e.message || "Có lỗi xảy ra");
                            } finally {
                                setSubmitting(false);
                            }
                        }
                    }
                ]
            );
        } else if (isTerminationRequest) {
            Alert.alert("Xác nhận", "Bạn muốn TỪ CHỐI chấm dứt? Hợp đồng sẽ tiếp tục.", [
                { text: "Hủy", style: "cancel" },
                { text: "Từ chối chấm dứt", onPress: async () => {
                        try { setSubmitting(true); await respondToTermination(contractId, 'reject'); navigation.goBack(); }
                        catch (error) { Alert.alert("Lỗi", error.message); } finally { setSubmitting(false); }
                    }}
            ]);
        }
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={colors.primary || '#0066CC'} />
                <Text style={{marginTop: 10, color: '#6B7280'}}>Đang tải dữ liệu...</Text>
            </View>
        );
    }

    if (error || !contract) {
        // ... giữ nguyên ...
        return (
            <View style={styles.center}>
                <Text style={{color: 'red', marginBottom: 10}}>{error || "Không có dữ liệu."}</Text>
                <TouchableOpacity onPress={loadData} style={styles.retryBtn}>
                    <Text style={{color: 'white'}}>Thử lại</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.retryBtn, {marginTop: 10, backgroundColor: '#9CA3AF'}]}>
                    <Text style={{color: 'white'}}>Quay lại</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.headerTitle}>{getHeaderTitle()}</Text>

                {/* --- THÔNG TIN CƠ BẢN --- */}
                <View style={styles.card}>
                    <View style={styles.row}>
                        <Text style={styles.label}>Số hợp đồng:</Text>
                        <Text style={styles.value}>{contract.contract_number || '---'}</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.row}>
                        <Text style={styles.label}>Phòng / Tòa nhà:</Text>
                        <Text style={styles.value}>{contract.room_number} - {contract.building_name}</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.row}>
                        <Text style={styles.label}>Thời hạn thuê:</Text>
                        <Text style={styles.value}>{contract.duration_months ? `${contract.duration_months} tháng` : '---'}</Text>
                    </View>
                    <Text style={styles.dateText}>({formatDate(contract.start_date)} - {formatDate(contract.end_date)})</Text>
                    <View style={styles.divider} />
                    <View style={styles.row}>
                        <Text style={styles.label}>Tiền thuê:</Text>
                        <Text style={[styles.value, {color: colors.primary || '#0066CC'}]}>{formatCurrency(contract.rent_amount)} đ/tháng</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Tiền cọc:</Text>
                        <Text style={styles.value}>{formatCurrency(contract.deposit_amount)} đ</Text>
                    </View>
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
                    {/* --- [MỚI] Nút Xem PDF --- */}
                    <View style={styles.divider} />
                    <TouchableOpacity
                        style={styles.pdfButton}
                        onPress={handleViewPdf}
                        disabled={downloading}
                    >
                        {downloading ? (
                            <ActivityIndicator size="small" color={colors.primary} />
                        ) : (
                            <Text style={styles.pdfButtonText}>📄 Xem chi tiết Hợp đồng (PDF)</Text>
                        )}
                    </TouchableOpacity>
                    {/* ------------------------- */}

                </View>

                {/* --- NOTE --- */}
                {contract.note && (
                    <View style={[styles.card, { backgroundColor: '#FFFBEB', borderColor: '#FCD34D', borderWidth: 1 }]}>
                        <Text style={[styles.label, {color: '#D97706', marginBottom: 4}]}>Ghi chú:</Text>
                        <Text style={{color: '#92400E'}}>{contract.note}</Text>
                    </View>
                )}

                {/* ... (Phần Consent và Warning giữ nguyên) ... */}
                {isNewContract && (
                    <View style={styles.consentContainer}>
                        <Text style={styles.consentHeader}>Điều khoản & Cam kết</Text>
                        <TouchableOpacity style={styles.checkboxRow} onPress={() => setIsTermsChecked(!isTermsChecked)}>
                            <Checkbox style={styles.checkbox} value={isTermsChecked} onValueChange={setIsTermsChecked} color={isTermsChecked ? colors.primary : undefined} />
                            <Text style={styles.consentText}>
                                Tôi đồng ý với <Text style={styles.linkText} onPress={() => openDoc('Điều khoản', termsContent)}>Điều khoản sử dụng</Text>
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.checkboxRow} onPress={() => setIsPrivacyChecked(!isPrivacyChecked)}>
                            <Checkbox style={styles.checkbox} value={isPrivacyChecked} onValueChange={setIsPrivacyChecked} color={isPrivacyChecked ? colors.primary : undefined} />
                            <Text style={styles.consentText}>
                                Tôi đồng ý với <Text style={styles.linkText} onPress={() => openDoc('Chính sách bảo mật', privacyContent)}>Chính sách bảo mật</Text>
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}

                {isTerminationRequest && (
                    <View style={styles.warningBox}>
                        <Text style={styles.warningTitle}>⚠️ Yêu cầu chấm dứt</Text>
                        <Text style={styles.warningText}>Xác nhận chấm dứt hợp đồng trước hạn.</Text>
                    </View>
                )}
            </ScrollView>

            {/* --- FOOTER --- */}
            <View style={styles.footer}>
                <TouchableOpacity style={[styles.btn, styles.btnReject]} onPress={handleReject} disabled={submitting}>
                    <Text style={styles.btnTextReject}>{isNewContract ? "Từ chối" : "Giữ lại HĐ"}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.btn, styles.btnConfirm, (isNewContract && (!isTermsChecked || !isPrivacyChecked)) && styles.btnDisabled]}
                    onPress={handleConfirm}
                    disabled={(isNewContract && (!isTermsChecked || !isPrivacyChecked)) || submitting}
                >
                    {submitting ? <ActivityIndicator color="white" /> : <Text style={styles.btnTextConfirm}>{isNewContract ? "Chấp nhận hợp đồng" : "Đồng ý hủy"}</Text>}
                </TouchableOpacity>
            </View>

            {/* MODAL (Giữ nguyên) */}
            <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{modalContent.title}</Text>
                        <ScrollView style={styles.modalScroll}><Text>{modalContent.content}</Text></ScrollView>
                        <TouchableOpacity style={styles.closeBtn} onPress={() => setModalVisible(false)}><Text style={{color:'white'}}>Đóng</Text></TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    // ... (Giữ nguyên các styles cũ) ...
    container: { flex: 1, backgroundColor: '#F3F4F6' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    scrollContent: { padding: spacing.md, paddingBottom: 100 },
    headerTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: spacing.md, color: '#1F2937' },
    card: { backgroundColor: 'white', borderRadius: 12, padding: spacing.md, marginBottom: spacing.md, elevation: 2 },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
    divider: { height: 1, backgroundColor: '#E5E7EB', marginVertical: 8 },
    label: { color: '#6B7280', fontSize: 14 },
    value: { color: '#111827', fontSize: 16, fontWeight: '600' },
    dateText: { textAlign: 'right', fontSize: 12, color: '#9CA3AF', fontStyle: 'italic' },
    consentContainer: { marginTop: spacing.sm },
    consentHeader: { fontSize: 16, fontWeight: 'bold', marginBottom: spacing.sm },
    checkboxRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
    checkbox: { marginRight: 12 },
    consentText: { flex: 1, fontSize: 14 },
    linkText: { color: colors.primary || '#0066CC', fontWeight: 'bold', textDecorationLine: 'underline' },
    warningBox: { backgroundColor: '#FEF2F2', padding: spacing.md, borderRadius: 8, borderColor: '#FECACA', borderWidth: 1 },
    warningTitle: { color: '#DC2626', fontWeight: 'bold' },
    warningText: { color: '#991B1B', fontSize: 13 },
    footer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'white', padding: spacing.md, flexDirection: 'row', gap: 12, elevation: 10 },
    btn: { flex: 1, paddingVertical: 14, borderRadius: 8, alignItems: 'center' },
    btnReject: { backgroundColor: '#FEE2E2' },
    btnTextReject: { color: '#DC2626', fontWeight: '600' },
    btnConfirm: { backgroundColor: colors.primary || '#0066CC' },
    btnTextConfirm: { color: 'white', fontWeight: 'bold' },
    btnDisabled: { backgroundColor: '#9CA3AF', opacity: 0.7 },
    retryBtn: { padding: 12, backgroundColor: '#0066CC', borderRadius: 8, paddingHorizontal: 24 },
    modalContainer: { flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', padding: 20 },
    modalContent: { backgroundColor: 'white', borderRadius: 12, padding: 20, maxHeight: '80%' },
    modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
    modalScroll: { marginBottom: 15 },
    closeBtn: { backgroundColor: '#374151', padding: 12, borderRadius: 8, alignItems: 'center' },


    pdfButton: {
        marginTop: 4,
        paddingVertical: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.primary || '#0066CC',
        borderStyle: 'dashed',
        alignItems: 'center',
        backgroundColor: '#F0F9FF',
    },
    pdfButtonText: {
        color: colors.primary || '#0066CC',
        fontWeight: '600',
        fontSize: 14
    }
});