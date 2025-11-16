// src/services/api/guest.js
import { http, unwrap } from "../http";

// =====================================
// 📌 GUEST REGISTRATION API SERVICE
// =====================================

/**
 * Tạo đăng ký khách (Tenant)
 * POST /guest/
 */
export function createGuestRegistration(data) {
  return unwrap(http.post("/guest", data));
}

/**
 * Cập nhật đăng ký khách (Tenant)
 * PUT /guest/:id
 */
export function updateGuestRegistration(id, data) {
  return unwrap(http.put(`/guest/${id}`, data));
}

/**
 * Xóa đăng ký khách (Tenant)
 * DELETE /guest/:id
 */
export function deleteGuestRegistration(id) {
  return unwrap(http.delete(`/guest/${id}`));
}

/**
 * Hủy đăng ký khách (Tenant + Shared)
 * POST /guest/:id/cancel
 */
export function cancelGuestRegistration(id, data) {
  return unwrap(http.post(`/guest/${id}/cancel`, data));
}

// =====================================
// 📌 MANAGER / OWNER ACTIONS
// =====================================

/**
 * Phê duyệt đăng ký khách
 * POST /guest/:id/approve
 */
export function approveGuestRegistration(id) {
  return unwrap(http.post(`/guest/${id}/approve`));
}

/**
 * Từ chối đăng ký khách
 * POST /guest/:id/reject
 */
export function rejectGuestRegistration(id, data) {
  return unwrap(http.post(`/guest/${id}/reject`, data)); // { reason }
}

// =====================================
// 📌 SHARED ROUTES (Tenant / Manager / Owner)
// =====================================

/**
 * Lấy danh sách đăng ký khách
 * GET /guest/
 * @param {Object} params = { page, limit, status, ... }
 */
export function getGuestRegistrations(params = {}) {
  return unwrap(http.get("/guest", { params }));
}

/**
 * Lấy thống kê đăng ký khách
 * GET /guest/stats
 */
export function getGuestRegistrationStats() {
  return unwrap(http.get("/guest/stats"));
}

/**
 * Lấy chi tiết 1 đăng ký khách theo ID
 * GET /guest/:id
 */
export function getGuestRegistrationById(id) {
  return unwrap(http.get(`/guest/${id}`));
}
