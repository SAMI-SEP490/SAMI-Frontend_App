import { http, unwrap } from "../http";

/**
 * Get bills for the current logged-in tenant
 * GET /bill/list
 */
export function getMyBills() {
  return unwrap(http.get("/bill/list"));
}

/**
 * Get unpaid bills (for quick access/badges)
 * GET /bill/list/unpaid
 */
export function getMyUnpaidBills() {
  return unwrap(http.get("/bill/list/unpaid"));
}

/**
 * Get specific bill detail
 * GET /bill/detail/:id
 */
export function getBillDetail(billId) {
  return unwrap(http.get(`/bill/detail/${billId}`));
}
