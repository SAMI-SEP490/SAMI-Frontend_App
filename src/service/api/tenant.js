// src/service/api/tenant.js
// API cho tenant (mobile) & một số API thống kê cho owner/manager

import { http, unwrap } from "../http";

/**
 * 🔍 Tìm kiếm Tenant theo tên (Owner, Manager)
 */
export function searchTenantsByName(name) {
  return unwrap(http.get("/tenants/search", { params: { name } }));
}

/**
 * 📊 Lấy dữ liệu thống kê tỉ lệ lấp đầy (Owner, Manager)
 */
export function getOccupancyAnalytics() {
  return unwrap(http.get("/tenants/analytics/occupancy"));
}

/**
 * 👩‍🦰 Lấy dữ liệu phân bố giới tính của Tenant (Owner, Manager)
 */
export function getTenantGenderDistribution() {
  return unwrap(http.get("/tenants/analytics/gender"));
}

/**
 * 🎂 Lấy dữ liệu phân bố độ tuổi của Tenant (Owner, Manager)
 */
export function getTenantAgeDistribution() {
  return unwrap(http.get("/tenants/analytics/age"));
}

/**
 * ⏰ Lấy danh sách hợp đồng sắp hết hạn (Owner, Manager)
 */
export function getExpiringContracts() {
  return unwrap(http.get("/tenants/analytics/expiring"));
}

/**
 * 💰 Lấy DANH SÁCH HÓA ĐƠN CHƯA THANH TOÁN của tenant (mobile)
 *
 * ⚠️ BE route /tenant/bills đang lỗi Prisma (do status notIn: ['master', ...]),
 * nên ở mobile ta dùng tạm route /tenant/bills-unpaid để tránh lỗi.
 *
 * Backend: GET /api/tenant/bills-unpaid  (tenant.routes -> '/bills-unpaid')
 */
export function getAllTenantBills() {
  // http đã có baseURL = '.../api' nên chỉ cần '/tenant/bills-unpaid'
  return unwrap(http.get("/tenant/bills-unpaid"));
}

/**
 * Nếu sau này cần tách riêng, vẫn có hàm này.
 */
export function getAllUnpaidTenantBills() {
  return unwrap(http.get("/tenant/bills-unpaid"));
}
