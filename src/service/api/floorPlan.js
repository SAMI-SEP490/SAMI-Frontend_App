// src/service/api/floorPlan.js
import { http, unwrap } from "../http";

/**
 * Lấy chi tiết plan theo ID
 * GET /floor-plan/:id
 */
export function getFloorPlanById(id) {
  return unwrap(http.get(`/floor-plan/${id}`));
}

/**
 * Lấy danh sách floor plan theo tòa nhà
 * GET /floor-plan/building/:buildingId
 * params: { latest_only, is_published, floor_number, ... }
 */
export function getFloorPlansByBuilding(buildingId, params = {}) {
  return unwrap(http.get(`/floor-plan/building/${buildingId}`, { params }));
}
