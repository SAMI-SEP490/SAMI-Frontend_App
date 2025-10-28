import React, { createContext, useState } from "react";

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  // Dữ liệu mẫu thông báo từ Ban quản lý tòa nhà
  const [notificationData, setNotificationData] = useState([
    {
      id: "NT001",
      title: "Thông báo cắt điện tạm thời",
      message:
        "Ban quản lý xin thông báo: Tòa nhà sẽ tạm ngừng cung cấp điện để bảo trì hệ thống vào ngày 30/10/2025 từ 8:00 đến 11:00 sáng. Quý cư dân vui lòng chuẩn bị trước.",
      date: "28/10/2025",
      sender: "Ban Quản Lý Tòa Nhà",
      type: "Cắt điện",
      isRead: false,
    },
    {
      id: "NT002",
      title: "Cắt nước định kỳ",
      message:
        "Do công tác bảo trì đường ống, nước sẽ bị cắt vào ngày 29/10/2025 từ 13:00 đến 17:00. Xin lỗi vì sự bất tiện này.",
      date: "27/10/2025",
      sender: "Ban Quản Lý Tòa Nhà",
      type: "Cắt nước",
      isRead: false,
    },
    {
      id: "NT003",
      title: "Tăng giá điện sinh hoạt",
      message:
        "Theo quy định mới của Bộ Công Thương, giá điện sinh hoạt sẽ tăng thêm 3% kể từ ngày 01/11/2025.",
      date: "25/10/2025",
      sender: "Ban Quản Lý Tòa Nhà",
      type: "Thông báo chung",
      isRead: true,
    },
    {
      id: "NT004",
      title: "Bảo trì thang máy",
      message:
        "Thang máy số 2 sẽ tạm ngừng hoạt động để bảo trì vào ngày 31/10/2025. Cư dân vui lòng sử dụng thang máy số 1 và 3 trong thời gian này.",
      date: "24/10/2025",
      sender: "Ban Quản Lý Kỹ Thuật",
      type: "Bảo trì",
      isRead: true,
    },
    {
      id: "NT005",
      title: "Tổ chức họp cư dân tháng 11",
      message:
        "Kính mời quý cư dân tham gia buổi họp định kỳ tháng 11 vào lúc 18:30 ngày 05/11/2025 tại sảnh tầng trệt.",
      date: "23/10/2025",
      sender: "Ban Quản Lý Tòa Nhà",
      type: "Họp cư dân",
      isRead: false,
    },
  ]);

  return (
    <NotificationContext.Provider
      value={{
        notificationData,
        setNotificationData,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
