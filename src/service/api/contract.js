// src/services/api/contract.js
import { http, unwrap } from "../http";
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Platform, Alert } from "react-native";

const { StorageAccessFramework } = FileSystem;

// ==========================================
// 📌 CONTRACT API SERVICE (TENANT VERSION)
// ==========================================

/**
 * Lấy danh sách hợp đồng của Tenant
 */
export function getContracts(params = {}) {
  return unwrap(http.get("/contract", { params }));
}

/**
 * Lấy chi tiết hợp đồng
 */
export function getContractDetail(contractId) {
  return unwrap(http.get(`/contract/${contractId}`));
}

// ==========================================
// 📌 TENANT ACTIONS (BỔ SUNG)
// ==========================================

/**
 * Tenant chấp thuận/từ chối hợp đồng
 * @param {number} contractId
 * @param {string} action - 'accept' | 'reject' (QUAN TRỌNG: Cần thêm tham số này)
 * @param {string} reason - Lý do nếu từ chối
 */
export function approveContract(contractId, action, reason = null) {
  // Backend cần body: { action: "accept", reason: ... }
  return unwrap(http.post(`/contract/${contractId}/approve`, {
    action: action,
    reason: reason
  }));
}

/**
 * Tenant phản hồi yêu cầu chấm dứt hợp đồng
 * @param {number} contractId
 * @param {string} action - 'approve' | 'reject' (Lưu ý: Backend đợi biến tên là 'action', không phải 'decision')
 * @param {string} note - Ghi chú thêm
 */
export function respondToTermination(contractId, action, note = "") {
  // Controller: const { action } = req.body; -> Cần gửi key là "action"
  return unwrap(http.post(`/contract/${contractId}/respond-termination`, {
    action: action,
    reason: note // Backend controller logic Termination có thể dùng 'reason' hoặc 'note', nên gửi cả 2 cho chắc hoặc check lại controller
  }));
}
/**
 * Kiểm tra xem Tenant có hợp đồng nào cần xử lý gấp không
 * @returns {Promise<Object|null>} Trả về object hợp đồng hoặc null
 */
export function checkPendingAction() {
  return unwrap(http.get('/contract/pending-action'));
}
// ==========================================
// 📌 DOWNLOAD & FILE HANDLING
// ==========================================

/**
 * Helper: Lấy đuôi file từ MIME type hoặc tên file (để tránh lỗi lưu ảnh thành pdf)
 */
const getExtension = (filename, mimeType) => {
  if (filename && filename.includes('.')) return ''; // Đã có đuôi
  if (mimeType === 'application/pdf') return '.pdf';
  if (mimeType === 'image/jpeg') return '.jpg';
  if (mimeType === 'image/png') return '.png';
  return '.pdf'; // Default fallback
};

/**
 * 1. Tải file về Cache
 * @param {number} contractId
 * @param {string} serverFileName - Tên file gốc từ server (nếu có)
 */
export async function downloadContractToCache(contractId, serverFileName = null) {
  try {
    console.log(`[ContractAPI] Getting link for ID: ${contractId}...`);

    // Gọi API lấy link download
    const res = await unwrap(http.get(`/contract/${contractId}/download`));
    const downloadUrl = res?.download_url || res?.data?.download_url;

    // Lấy thông tin file để đặt tên đúng đuôi
    const mimeType = res?.mime_type || 'application/pdf'; // Backend nên trả về field này
    const extension = getExtension(serverFileName, mimeType);

    // Tạo tên file an toàn: contract_123.pdf hoặc contract_123.jpg
    const safeFileName = serverFileName || `contract_${contractId}${extension}`;
    const fileUri = FileSystem.cacheDirectory + safeFileName;

    if (!downloadUrl) throw new Error("Không tìm thấy link tải.");

    const downloadRes = await FileSystem.downloadAsync(downloadUrl, fileUri);

    if (downloadRes.status !== 200) {
      throw new Error("Tải file thất bại.");
    }

    return {
      uri: downloadRes.uri,
      name: safeFileName,
      mimeType: mimeType
    };

  } catch (error) {
    console.error("[ContractAPI] Download Error:", error);
    throw error;
  }
}

/**
 * 2. Lưu file vào máy (Android/iOS)
 * @param {Object} fileInfo - { uri, name, mimeType } lấy từ hàm downloadContractToCache
 */
export async function saveContractToDevice(fileInfo) {
  const { uri, name, mimeType } = fileInfo;

  if (Platform.OS === 'android') {
    try {
      const permissions = await StorageAccessFramework.requestDirectoryPermissionsAsync();
      if (!permissions.granted) return;

      const fileData = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64
      });

      // Tạo file với đúng mimeType (ảnh hoặc pdf)
      const newFileUri = await StorageAccessFramework.createFileAsync(
          permissions.directoryUri,
          name,
          mimeType
      );

      await FileSystem.writeAsStringAsync(newFileUri, fileData, {
        encoding: FileSystem.EncodingType.Base64
      });

      Alert.alert("Thành công", "Đã lưu hợp đồng về máy.");

    } catch (e) {
      console.error(e);
      Alert.alert("Lỗi", "Không thể lưu file. Vui lòng thử lại.");
    }
  } else {
    // iOS
    await Sharing.shareAsync(uri);
  }
}