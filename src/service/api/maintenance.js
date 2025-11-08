// src/services/api/maintenance.js
import { http, unwrap } from "../http";

// ====== MAINTENANCE API SERVICE ======

/**
 * Lấy thống kê tổng quan bảo trì
 * @returns {Promise<Object>}
 */
export function getMaintenanceStatistics() {
  return unwrap(http.get("/maintenance/statistics"));
} 

/**
 * Lấy lịch sử bảo trì của một phòng
 * @param {string|number} roomId
 */
export function getRoomMaintenanceHistory(roomId) {
  return unwrap(http.get(`/maintenance/room/${roomId}/history`));
}

/**
 * Tạo yêu cầu bảo trì mới (tenant)
 * @param {Object} data - { title, description, roomId, category, ... }
 */
export function createMaintenanceRequest(data) {
  return unwrap(http.post("/maintenance", data));
}

/**
 * Lấy danh sách yêu cầu bảo trì
 * (tùy quyền: owner, manager, tenant)
 */
export function listMaintenanceRequests(params = {}) {
  return unwrap(http.get("/maintenance", { params }));
}

/**
 * Lấy yêu cầu bảo trì theo ID
 * @param {string|number} id
 */
export function getMaintenanceRequestById(id) {
  return unwrap(http.get(`/maintenance/${id}`));
}

/**
 * Cập nhật yêu cầu bảo trì
 * @param {string|number} id
 * @param {Object} data
 */
export function updateMaintenanceRequest(id, data) {
  return unwrap(http.put(`/maintenance/${id}`, data));
}

/**
 * Xóa yêu cầu bảo trì
 * (tenant chỉ xóa được yêu cầu pending của chính mình)
 * @param {string|number} id
 */
export function deleteMaintenanceRequest(id) {
  return unwrap(http.delete(`/maintenance/${id}`));
}

/**
 * Phê duyệt yêu cầu bảo trì
 * (owner, manager)
 * @param {string|number} id
 */
export function approveMaintenanceRequest(id) {
  return unwrap(http.post(`/maintenance/${id}/approve`));
}

/**
 * Từ chối yêu cầu bảo trì
 * @param {string|number} id
 * @param {Object} data - { reason: "..." }
 */
export function rejectMaintenanceRequest(id, data) {
  return unwrap(http.post(`/maintenance/${id}/reject`, data));
}

/**
 * Đánh dấu đã giải quyết (owner, manager)
 * @param {string|number} id
 * @param {Object} data - { solution, cost, resolvedAt, ... }
 */
export function resolveMaintenanceRequest(id, data) {
  return unwrap(http.post(`/maintenance/${id}/resolve`, data));
}

/**
 * Đánh dấu hoàn thành (owner, manager)
 * @param {string|number} id
 */
export function completeMaintenanceRequest(id) {
  return unwrap(http.post(`/maintenance/${id}/complete`));
}
