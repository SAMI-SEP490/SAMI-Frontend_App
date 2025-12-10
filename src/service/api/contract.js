// src/services/api/contract.js
import { http, unwrap } from "../http";

// ====== CONTRACT API SERVICE (TENANT) ======

/**
 * Lấy danh sách hợp đồng (tenant, owner, manager)
 * @param {Object} params - query params nếu cần lọc/pagination
 * @returns {Promise<Object>}
 */
export function getContracts(params = {}) {
  return unwrap(http.get("/contract", { params }));
}
