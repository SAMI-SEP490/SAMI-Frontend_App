// src/service/api/building.js
import { http, unwrap } from "../http";

/**
 * Lấy danh sách tòa nhà (tenant cũng gọi được)
 * Backend: GET /building
 */
export function getBuildings(params = {}) {
  return unwrap(http.get("/building", { params }));
}

/**
 * Lấy chi tiết 1 tòa nhà
 * Backend: GET /building/:id
 */
export function getBuildingById(id) {
  return unwrap(http.get(`/building/${id}`));
}

/**
 * Lấy thông tin chi tiết (giá điện, nước...) của các tòa nhà mà tenant đang thuê
 * Backend: GET /building/tenant/my-info
 */
export function getMyBuildingDetails() {
  return unwrap(http.get("/building/tenant/my-info"));
}
