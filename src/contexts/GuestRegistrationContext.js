import React, { createContext, useState } from "react";

export const GuestRegistrationContext = createContext();

export const GuestRegistrationProvider = ({ children }) => {
  const [guestRegistration, setGuestRegistration] = useState([
    {
      id: 1,
      name: "Nguyễn Văn A",
      phone: "0912345678",
      startDate: "12/10/2025",
      endDate: "14/10/2025",
      reason: "Thăm người thân",
      note: "Sẽ đến cùng gia đình",
      status: "Chờ xử lý",
    },
    {
      id: 2,
      name: "Trần Thị B",
      phone: "0987654321",
      startDate: "15/10/2025",
      endDate: "17/10/2025",
      reason: "Công tác",
      note: "Làm việc tại văn phòng 3 ngày",
      status: "Chấp nhận",
    },
    {
      id: 3,
      name: "Lê Minh C",
      phone: "0905123456",
      startDate: "20/10/2025",
      endDate: "25/10/2025",
      reason: "Du lịch",
      note: "Đi cùng đoàn 5 người",
      status: "Từ chối",
    },
    {
      id: 4,
      name: "Phạm Thùy D",
      phone: "0933555777",
      startDate: "01/11/2025",
      endDate: "03/11/2025",
      reason: "Khác",
      note: "Tham gia hội thảo",
      status: "Chờ xử lý",
    },
  ]);

  const updateGuestRegistration = (updatedGuest) => {
    setGuestRegistration((prev) =>
      prev.map((g) => (g.id === updatedGuest.id ? updatedGuest : g))
    );
  };

  const deleteGuestRegistration = (id) => {
    setGuestRegistration((prev) => prev.filter((g) => g.id !== id));
  };

  return (
    <GuestRegistrationContext.Provider
      value={{
        guestRegistration,
        setGuestRegistration,
        updateGuestRegistration,
        deleteGuestRegistration,
      }}
    >
      {children}
    </GuestRegistrationContext.Provider>
  );
};
