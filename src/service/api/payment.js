// src/service/api/payment.js
import { http, unwrap } from "../http";

/**
 * Tạo thanh toán PayOS cho danh sách bill
 * Backend: POST /api/payments/create-payos
 */
export function createPayOSPayment(billIds) {
  return unwrap(
    http.post("/payments/create-payos", {
      billIds,
    })
  );
}

/**
 * (Tuỳ chọn) Tạo thanh toán VNPay
 * Backend: POST /api/payments/create
 */
export function createVnpayPayment(billIds) {
  return unwrap(
    http.post("/payments/create", {
      billIds,
    })
  );
}

/**
 * Lịch sử thanh toán của tenant
 * Backend: GET /api/payments/history
 */
export function getTenantPaymentHistory() {
  return unwrap(http.get("/payments/history"));
}
