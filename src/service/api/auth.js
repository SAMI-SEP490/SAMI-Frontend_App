import { http, unwrap } from "../http";

// ====== AUTH API SERVICE ======

/**
 * Đổi mật khẩu (Tenant, Owner, Manager)
 * Yêu cầu: Đã đăng nhập (Token sẽ được tự động gắn bởi http interceptor)
 * Endpoint: POST /auth/change-password
 * @param {Object} data 
 * @param {string} data.currentPassword - Mật khẩu cũ
 * @param {string} data.newPassword - Mật khẩu mới
 */
export function changePassword(data) {
  return unwrap(http.post("/auth/change-password", data));
}

/**
 * Gửi yêu cầu quên mật khẩu (Bước 1)
 * Endpoint: POST /auth/forgot-password
 * @param {string} email - Email người dùng
 */
export function forgotPassword(email) {
  return unwrap(http.post("/auth/forgot-password", { email }));
}

/**
 * Xác thực OTP cho quy trình quên mật khẩu (Bước 2)
 * Endpoint: POST /auth/verify-otp-forgot
 * @param {Object} data - { userId, otp }
 */
export function verifyForgotOtp(data) {
  // Ép kiểu String cho OTP để tránh lỗi so sánh số vs chuỗi
  return unwrap(http.post("/auth/verify-otp-forgot", { 
    userId: data.userId, 
    otp: String(data.otp) 
  }));
}

/**
 * Gửi lại OTP cho quy trình quên mật khẩu
 * Endpoint: POST /auth/resend-otp-forgot
 * @param {Object} data - { userId }
 */
export function resendForgotOtp(data) {
  return unwrap(http.post("/auth/resend-otp-forgot", data));
}

/**
 * Đặt lại mật khẩu mới (Bước 3)
 * Endpoint: POST /auth/reset-password
 * @param {Object} data - { userId, resetToken, newPassword }
 */
export function resetPassword(data) {
  return unwrap(http.post("/auth/reset-password", data));
}

/**
 * Xác thực OTP đăng nhập lần đầu (First Login)
 * Endpoint: POST /auth/verify-otp
 * @param {Object} data - { userId, otp }
 */
export function verifyLoginOtp(data) {
  return unwrap(http.post("/auth/verify-otp", { 
    userId: data.userId, 
    otp: String(data.otp) 
  }));
}
