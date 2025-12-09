import { http, unwrap } from "../http";

// ====== AUTH API SERVICE ======

/**
 * Đổi mật khẩu (Tenant, Owner, Manager)
 * Yêu cầu: Đã đăng nhập (Token sẽ được tự động gắn bởi http interceptor)
 * Endpoint: POST /auth/change-password
 * * @param {Object} data 
 * @param {string} data.old_password - Mật khẩu cũ
 * @param {string} data.new_password - Mật khẩu mới
 * @param {string} data.confirm_password - Xác nhận mật khẩu mới
 */
export function changePassword(data) {
  return unwrap(http.post("/auth/change-password", data));
}

/**
 * Xác thực OTP cho quy trình quên mật khẩu
 * Endpoint: POST /auth/verify-otp-forgot
 * @param {Object} data - { email, otp }
 */
export function verifyForgotOtp(data) {
  return unwrap(http.post("/auth/verify-otp-forgot", data));
}

/**
 * Gửi lại OTP cho quy trình quên mật khẩu
 * Endpoint: POST /auth/resend-otp-forgot
 * @param {Object} data - { email }
 */
export function resendForgotOtp(data) {
  return unwrap(http.post("/auth/resend-otp-forgot", data));
}

/**
 * Đặt lại mật khẩu mới
 * Endpoint: POST /auth/reset-password
 * @param {Object} data - { email, otp, new_password, confirm_password }
 */
export function resetPassword(data) {
  return unwrap(http.post("/auth/reset-password", data));
}
