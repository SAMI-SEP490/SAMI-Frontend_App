// src/service/api/payment.js
import { http, unwrap } from "../http";

/**
 * 📜 Lịch sử thanh toán hóa đơn của tenant hiện tại
 * Backend: GET /api/payment/history  (requireRole(['tenant']))
 */
export function getTenantPaymentHistory() {
  return unwrap(http.get("/payment/history"));
}
