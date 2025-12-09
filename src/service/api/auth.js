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
