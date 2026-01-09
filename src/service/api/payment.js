import { http, unwrap } from "../http";

/**
 * Create PayOS Payment Link
 * POST /payment/create-payos
 * Body: { billIds: [1, 2] }
 */
export function createPayOSLink(billIds) {
  return unwrap(http.post("/payments/create-payos", { billIds }));
}

/**
 * Get Tenant Payment History
 * GET /payment/history
 */
export function getPaymentHistory() {
  return unwrap(http.get("/payments/history"));
}
