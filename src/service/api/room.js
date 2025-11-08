// Updated: 2025-11-08
// By: MinhBH
// src/services/api/room.js

import { http, unwrap } from "../http";

// ====== ROOM API SERVICE ======

/**
 * Tạo phòng mới (owner, manager)
 * @param {Object} data - { name, buildingId, floor, capacity, status, ... }
 */
export function createRoom(data) {
  return unwrap(http.post("/room", data));
}

/**
 * Lấy danh sách phòng (owner, manager)
 * @param {Object} params - { buildingId, floor, status, ... }
 */
export function getRooms(params = {}) {
  return unwrap(http.get("/room", { params }));
}

/**
 * Lấy thông tin phòng theo ID (owner, manager, tenant)
 * @param {string|number} id
 */
export function getRoomById(id) {
  return unwrap(http.get(`/room/${id}`));
}

/**
 * Lấy danh sách phòng theo userId (owner, manager, tenant)
 * @param {string|number} userId
 */
export function getRoomsByUserId(userId) {
  return unwrap(http.get(`/room/user/${userId}`));
}

/**
 * Lấy thống kê phòng theo building (owner, manager)
 * @param {string|number} buildingId
 */
export function getRoomStatisticsByBuilding(buildingId) {
  return unwrap(http.get(`/room/statistics/building/${buildingId}`));
}

/**
 * Cập nhật thông tin phòng (owner, manager)
 * @param {string|number} id
 * @param {Object} data
 */
export function updateRoom(id, data) {
  return unwrap(http.put(`/room/${id}`, data));
}

/**
 * Vô hiệu hóa phòng (owner, manager)
 * @param {string|number} id
 */
export function deactivateRoom(id) {
  return unwrap(http.post(`/room/${id}/deactivate`));
}

/**
 * Kích hoạt lại phòng (owner, manager)
 * @param {string|number} id
 */
export function activateRoom(id) {
  return unwrap(http.post(`/room/${id}/activate`));
}

/**
 * Xóa vĩnh viễn phòng (chỉ owner)
 * @param {string|number} id
 */
export function hardDeleteRoom(id) {
  return unwrap(http.delete(`/room/${id}/permanent`));
}
