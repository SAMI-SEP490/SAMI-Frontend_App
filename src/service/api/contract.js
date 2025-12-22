// src/services/api/contract.js
import { http, unwrap } from "../http";
// Using Legacy API for stability (works with current build)
import * as FileSystem from 'expo-file-system/legacy'; 
import * as Sharing from 'expo-sharing';
import { Platform, Alert } from "react-native";

const { StorageAccessFramework } = FileSystem;

// ==========================================
// 📌 CONTRACT API SERVICE
// ==========================================

/**
 * Lấy danh sách hợp đồng (tenant, owner, manager)
 * @param {Object} params - query params nếu cần lọc/pagination (page, limit, status...)
 * @returns {Promise<Object>}
 */
export function getContracts(params = {}) {
  return unwrap(http.get("/contract", { params }));
}

/**
 * Lấy chi tiết hợp đồng theo ID
 * @param {number} contractId 
 * @returns {Promise<Object>}
 */
export function getContractDetail(contractId) {
  return unwrap(http.get(`/contract/${contractId}`));
}

/**
 * 1. Internal: Tải file về thư mục Cache tạm thời
 * @param {number} contractId 
 * @param {string} fileName 
 * @returns {Promise<string>} URI của file trong cache
 */
export async function downloadContractToCache(contractId, fileName = "contract.pdf") {
  try {
    console.log(`[ContractAPI] Fetching URL for ID: ${contractId}...`);
    
    // 1. Get presigned URL from Backend
    const res = await unwrap(http.get(`/contract/${contractId}/download`));
    const downloadUrl = res?.download_url || res?.data?.download_url;

    if (!downloadUrl) throw new Error("Link tải không tồn tại.");

    // 2. Define local path in Cache
    const fileUri = FileSystem.cacheDirectory + fileName;

    console.log("[ContractAPI] Downloading to cache:", fileUri);
    
    // 3. Download
    const downloadRes = await FileSystem.downloadAsync(downloadUrl, fileUri);

    if (downloadRes.status !== 200) {
        throw new Error("Tải file thất bại.");
    }

    return downloadRes.uri;
  } catch (error) {
    console.error("[ContractAPI] Error:", error);
    throw error;
  }
}

/**
 * 2. Option A: Lưu file vào bộ nhớ máy (Persistent)
 * - Android: Sử dụng Storage Access Framework để chọn thư mục
 * - iOS: Mở Share Sheet (người dùng chọn "Save to Files")
 * @param {string} fileUri - URI file trong cache
 * @param {string} fileName 
 */
export async function saveContractToDevice(fileUri, fileName) {
  if (Platform.OS === 'android') {
    try {
      // 1. Request permission to access a directory
      const permissions = await StorageAccessFramework.requestDirectoryPermissionsAsync();
      
      if (!permissions.granted) {
        return; // User cancelled
      }

      // 2. Read file from cache as Base64
      const fileData = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.Base64
      });

      // 3. Create file in selected directory
      const newFileUri = await StorageAccessFramework.createFileAsync(
        permissions.directoryUri,
        fileName,
        'application/pdf'
      );

      // 4. Write data
      await FileSystem.writeAsStringAsync(newFileUri, fileData, {
        encoding: FileSystem.EncodingType.Base64
      });

      Alert.alert("Thành công", "Đã lưu file vào thư mục bạn chọn.");

    } catch (e) {
      console.error(e);
      Alert.alert("Lỗi", "Không thể lưu file.");
    }
  } else {
    // iOS doesn't allow direct saving without user interaction via Share Sheet
    await Sharing.shareAsync(fileUri);
  }
}

/**
 * 3. Option B: Chia sẻ file (Share Sheet)
 * @param {string} fileUri - URI file trong cache
 */
export async function shareContractFile(fileUri) {
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(fileUri);
  } else {
    Alert.alert("Lỗi", "Thiết bị không hỗ trợ chia sẻ.");
  }
}
