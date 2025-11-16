// src/services/api/regulation.js
import { http, unwrap } from "../http";

// ====== REGULATION API SERVICE ======

/**
 * Lấy danh sách regulations (có filter và pagination)
 * @param {Object} params - { building_id, status, target, version, page, limit, include_archived }
 */
export function listRegulations(params = {}) {
  return unwrap(http.get("/regulation", { params }));
}

/**
 * Lấy regulation theo ID
 * @param {string|number} id
 */
export function getRegulationById(id) {
  return unwrap(http.get(`/regulation/${id}`));
}

/**
 * Tạo regulation mới
 * @param {Object} data - { title, content, building_id, effective_date, status, target, note }
 * @param {number|string} createdBy
 */
export function createRegulation(data, createdBy) {
  return unwrap(http.post("/regulation", { ...data, createdBy }));
}

/**
 * Cập nhật regulation
 * @param {string|number} id
 * @param {Object} data - { title, content, effective_date, status, target, note }
 */
export function updateRegulation(id, data) {
  return unwrap(http.put(`/regulation/${id}`, data));
}

/**
 * Publish regulation
 * @param {string|number} id
 */
export function publishRegulation(id) {
  return unwrap(http.post(`/regulation/${id}/publish`));
}

/**
 * Archive regulation
 * @param {string|number} id
 */
export function archiveRegulation(id) {
  return unwrap(http.post(`/regulation/${id}/archive`));
}

/**
 * Xóa regulation (soft delete)
 * @param {string|number} id
 */
export function deleteRegulation(id) {
  return unwrap(http.delete(`/regulation/${id}`));
}

/**
 * Lấy tất cả versions của một regulation theo title
 * @param {string} title
 * @param {number|string|null} buildingId
 */
export function getRegulationVersions(title, buildingId = null) {
  const params = buildingId !== null ? { building_id: buildingId } : {};
  return unwrap(
    http.get(`/regulation/versions/${encodeURIComponent(title)}`, { params })
  );
}

/**
 * Thêm feedback cho regulation
 * @param {string|number} id
 * @param {number|string} userId
 * @param {string} comment
 */
export function addRegulationFeedback(id, userId, comment) {
  return unwrap(http.post(`/regulation/${id}/feedbacks`, { userId, comment }));
}

/**
 * Lấy feedbacks của regulation
 * @param {string|number} id
 * @param {Object} params - { page, limit }
 */
export function getRegulationFeedbacks(id, params = {}) {
  return unwrap(http.get(`/regulation/${id}/feedbacks`, { params }));
}

/**
 * Lấy thống kê regulations (tùy theo building)
 * @param {number|string|null} buildingId
 */
export function getRegulationStatistics(buildingId = null) {
  const url = buildingId
    ? `/regulation/statistics/${buildingId}`
    : "/regulation/statistics";
  return unwrap(http.get(url));
}

/**
 * Lấy regulations theo building
 * @param {number|string|null} buildingId
 * @param {Object} params - { status, target, latest_only, page, limit }
 */
export function getRegulationsByBuilding(buildingId, params = {}) {
  return unwrap(http.get(`/regulation/building/${buildingId}`, { params }));
}
