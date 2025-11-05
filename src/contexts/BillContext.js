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
      expense: 150000,
    },
    {
      id: 2,
      name: "Tiền giặt là",
      category: "Dịch vụ",
      period: "09/2025 - 10/2025",
      status: "Chưa trả",
      expense: 80000,
    },
    {
      id: 3,
      name: "Tiền điện",
      category: "Chi phí sinh hoạt",
      period: "08/2025 - 09/2025",
      status: "Đã trả",
      expense: 200000,
    },
    {
      id: 4,
      name: "Tiền nước",
      category: "Chi phí sinh hoạt",
      period: "09/2025 - 09/2025",
      status: "Đã trả",
      expense: 140000,
    },
  ]);

  const [transactionList, setTransactionList] = useState([
    {
      id: "123456ABC",
      time: "8:30 AM 28/09/2025",
      billCount: 1,
      status: "Thất bại",
    },
    {
      id: "456789XYZ",
      time: "8:45 AM 28/09/2025",
      billCount: 1,
      status: "Thành công",
    },
    {
      id: "246802QWE",
      time: "10:00 AM 20/09/2025",
      billCount: 2,
      status: "Thành công",
    },
    {
      id: "135791RTY",
      time: "9:00 AM 18/08/2025",
      billCount: 3,
      status: "Thành công",
    },
  ]);

  const [idBillListPayment, setIdBillListPayment] = useState([]);

  return (
    <BillContext.Provider
      value={{
        billData,
        setBillData,
        idBillListPayment,
        setIdBillListPayment,
        transactionList,
        setTransactionList,
      }}
    >
      {children}
    </BillContext.Provider>
  );
};
