// src/services/api/vehicle.js
import { http, unwrap } from "../http";

// ====== VEHICLE API SERVICE ======

/**
 * Lấy danh sách xe (vehicles)
 * @param {Object} params - { page, limit, filter, ... }
 */
export function getVehicles(params = {}) {
  return unwrap(http.get("/vehicles", { params }));
}

/**
 * Lấy thông tin xe theo ID
 * @param {string|number} id
 */
export function getVehicleById(id) {
  return unwrap(http.get(`/vehicles/${id}`));
}

// ====== VEHICLE REGISTRATION ======

/**
 * Tạo đăng ký xe mới (Tenant)
 * @param {Object} data - { vehicleType, licensePlate, description, ... }
 */
export function createVehicleRegistration(data) {
  return unwrap(http.post("/vehicle/registrations", data));
}

/**
 * Cập nhật đăng ký xe (Tenant)
 * @param {string|number} id
 * @param {Object} data
 */
export function updateVehicleRegistration(id, data) {
  return unwrap(http.put(`/vehicle/registrations/${id}`, data));
}

/**
 * Xóa đăng ký xe (Tenant)
 * @param {string|number} id
 */
export function deleteVehicleRegistration(id) {
  return unwrap(http.delete(`/vehicle/registrations/${id}`));
}

/**
 * Hủy đăng ký xe (Tenant)
 * @param {string|number} id
 * @param {Object} data - { reason: "..." }
 */
export function cancelVehicleRegistration(id, data) {
  return unwrap(http.post(`/vehicle/registrations/${id}/cancel`, data));
}

/**
 * Lấy danh sách đăng ký xe
 * (phụ thuộc quyền: Tenant, Manager, Owner)
 * @param {Object} params - { status, page, limit, ... }
 */
export function getVehicleRegistrations(params = {}) {
  return unwrap(http.get("/vehicle/registrations", { params }));
}

/**
 * Lấy thống kê đăng ký xe
 */
export function getVehicleRegistrationStats() {
  return unwrap(http.get("/vehicle/registrations/stats"));
}

/**
 * Lấy chi tiết đăng ký xe theo ID
 * @param {string|number} id
 */
export function getVehicleRegistrationById(id) {
  return unwrap(http.get(`/vehicle/registrations/${id}`));
}

/**
 * Phê duyệt đăng ký xe (Manager, Owner)
 * @param {string|number} id
 */
export function approveVehicleRegistration(id) {
  return unwrap(http.post(`/vehicle/registrations/${id}/approve`));
}

/**
 * Từ chối đăng ký xe (Manager, Owner)
 * @param {string|number} id
 * @param {Object} data - { reason: "..." }
 */
export function rejectVehicleRegistration(id, data) {
  return unwrap(http.post(`/vehicle/registrations/${id}/reject`, data));
}
