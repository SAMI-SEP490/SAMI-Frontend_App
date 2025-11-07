// src/services/api/users.js
import { http, unwrap } from "../http";

/**
 * Lấy danh sách tất cả người dùng (Owner, Manager)
 */
export function listUsers(params = {}) {
  return unwrap(http.get("/user/list-users", { params }));
}

/**
 * Lấy thông tin chi tiết của một người dùng theo ID (Owner, Manager)
 * @param {string|number} id
 */
export function getUserById(id) {
  return unwrap(http.get(`/user/get-user/${id}`));
}

/**
 * Tìm kiếm người dùng theo tên (Owner, Manager)
 * @param {string} keyword
 */
export function searchUsersByName(keyword) {
  return unwrap(http.get("/user/search", { params: { q: keyword } }));
}

/**
 * Xóa mềm người dùng theo ID (Owner, Manager)
 * @param {string|number} id
 */
export function softDeleteUser(id) {
  return unwrap(http.delete(`/user/delete/${id}`));
}

/**
 * Khôi phục người dùng đã bị xóa (Owner, Manager)
 * @param {string|number} id
 */
export function restoreUser(id) {
  return unwrap(http.post(`/user/restore/${id}`));
}

/**
 * Lấy danh sách người dùng đã bị xóa (Owner, Manager)
 */
export function getDeletedUsers() {
  return unwrap(http.get("/user/get-deleted"));
}

/**
 * Thay đổi vai trò của người dùng thành Tenant (Owner, Manager)
 * @param {Object} data - { userId: number }
 */
export function changeToTenant(data) {
  return unwrap(http.post("/user/change-to-tenant", data));
}

/**
 * Thay đổi vai trò của người dùng thành Manager (chỉ Owner)
 * @param {Object} data - { userId: number }
 */
export function changeToManager(data) {
  return unwrap(http.post("/user/change-to-manager", data));
}

/**
 * Cập nhật thông tin người dùng (Owner, Manager)
 * @param {string|number} id
 * @param {Object} data
 */
export function updateUser(id, data) {
  return unwrap(http.put(`/user/update/${id}`, data));
}
