import React, { createContext, useState } from "react";

export const BillContext = createContext();

export const BillProvider = ({ children }) => {
  const [billData, setBillData] = useState([
    {
      id: 1,
      name: "Tiền nước",
      category: "Chi phí sinh hoạt",
      period: "09/2025 - 10/2025",
      status: "Chưa trả",
    },
    {
      id: 2,
      name: "Tiền giặt là",
      category: "Dịch vụ",
      period: "09/2025 - 10/2025",
      status: "Chưa trả",
    },
    {
      id: 3,
      name: "Tiền điện",
      category: "Chi phí sinh hoạt",
      period: "08/2025 - 09/2025",
      status: "Đã trả",
    },
    {
      id: 4,
      name: "Tiền nước",
      category: "Chi phí sinh hoạt",
      period: "09/2025 - 09/2025",
      status: "Đã trả",
    },
  ]);

  return (
    <BillContext.Provider
      value={{
        billData,
        setBillData,
      }}
    >
      {children}
    </BillContext.Provider>
  );
};
