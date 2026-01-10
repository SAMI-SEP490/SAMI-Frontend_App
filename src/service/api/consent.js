// src/services/api/consent.js
import { http, unwrap } from "../http";

// ==========================================
// 📌 CONSENT API SERVICE
// ==========================================

/**
 * 3. Lấy lịch sử Consent của một user
 * @param {number} userId
 * @returns {Promise<Array>} Danh sách log consent
 */
export function getConsentHistory(userId) {
    // Route: GET /history/:userId
    return unwrap(http.get(`/consent/history/${userId}`));
}

/**
 * 4. Kiểm tra trạng thái Consent hiện tại (User đã đồng ý chưa?)
 * @param {number} userId
 * @param {string} consentType - VD: 'TERM_OF_SERVICE'
 * @returns {Promise<Object>} { hasAccepted: boolean, lastConsent: Object }
 */
export function checkConsentStatus(userId, consentType) {
    // Route: GET /check/:userId/:consentType
    return unwrap(http.get(`/consent/check/${userId}/${consentType}`));
}

/**
 * 5. Lấy nội dung phiên bản Consent đang hiệu lực (Active)
 * @param {string} consentType - VD: 'PRIVACY_POLICY'
 * @returns {Promise<Object>} Thông tin version và content
 */
export function getActiveConsentVersion(consentType) {
    // Route: GET /version/:consentType
    return unwrap(http.get(`/consent/version/${consentType}`));
}

/**
 * 6. Lấy danh sách tất cả các version (Thường cho Admin/Manager quản lý)
 * @param {Object} params - Query params (limit, page, type...)
 */
export function getAllVersions(params = {}) {
    // Route: GET /versions
    return unwrap(http.get("/consent/versions", { params }));
}

