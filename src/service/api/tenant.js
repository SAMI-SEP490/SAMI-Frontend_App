// src/services/api/tenant.js
// Updated: 2025-11-07
// by: MinhBH

import { http, unwrap } from "../http";

/**
 * 🔍 Tìm kiếm Tenant theo tên (Owner, Manager)
 * @param {string} name
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
 * 💰 Lấy tất cả hóa đơn của Tenant (Tenant)
 */
export function getAllTenantBills() {
  return unwrap(http.get("/tenants/bills"));
}

/**
 * ❌ Lấy tất cả hóa đơn chưa thanh toán của Tenant (Tenant)
 */
export function getAllUnpaidTenantBills() {
  return unwrap(http.get("/tenants/bills-unpaid"));
}
