import React, { createContext, useState } from "react";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userData, setUserData] = useState([
     {
      user_id: 1,
      phone: "+84901234567",
      email: "abc@gmail.com",
      password: "Thangminh1@",
      password_hash: "",
      full_name: "Nguyễn Tuấn A",
      gender: "male",
      birthday: "1992-03-15",
      avatar_url: "https://picsum.photos/seed/user1/200",
      status: "active",
      created_at: "2025-01-10T08:15:30Z",
      updated_at: "2025-06-12T10:20:00Z"
    },
    {
      user_id: 2,
      phone: "+84919876543",
      email: "le.thi.b@example.com",
      password: "password",
      password_hash: "",
      full_name: "Lê Thị Bích",
      gender: "female",
      birthday: "1988-11-02",
      avatar_url: "https://picsum.photos/seed/user2/200",
      status: "pending",
      created_at: "2025-02-22T09:30:00Z",
      updated_at: "2025-07-01T14:05:10Z"
    },
    {
      user_id: 3,
      phone: "+84987654321",
      email: "tran.minh.c@example.com",
      password: "password",
      password_hash: "",
      full_name: "Trần Minh C",
      gender: "male",
      birthday: "1995-06-20",
      avatar_url: "https://picsum.photos/seed/user3/200",
      status: "active",
      created_at: "2025-03-05T12:00:00Z",
      updated_at: "2025-08-02T09:40:00Z"
    },
    {
      user_id: 4,
      phone: "+84933445566",
      email: "pham.hoa.d@example.com",
      password: "password",
      password_hash: "",
      full_name: "Phạm Hoa D",
      gender: "female",
      birthday: "2000-01-30",
      avatar_url: "https://picsum.photos/seed/user4/200",
      status: "inactive",
      created_at: "2025-04-18T07:45:15Z",
      updated_at: "2025-09-10T11:11:11Z"
    },
    {
      user_id: 5,
      phone: "+84922113344",
      email: "hoang.v@example.com",
      password: "password",
      password_hash: "",
      full_name: "Hoàng Vương",
      gender: "male",
      birthday: "1985-09-09",
      avatar_url: "https://picsum.photos/seed/user5/200",
      status: "banned",
      created_at: "2025-05-01T16:20:00Z",
      updated_at: "2025-05-15T10:00:00Z"
    },
    {
      user_id: 6,
      phone: "+84915556677",
      email: "ngoc.tran6@example.com",
      password: "password",
      password_hash: "",
      full_name: "Ngọc Trần",
      gender: "female",
      birthday: "1998-12-12",
      avatar_url: "https://picsum.photos/seed/user6/200",
      status: "active",
      created_at: "2025-06-11T13:13:13Z",
      updated_at: "2025-09-20T08:00:00Z"
    },
    {
      user_id: 7,
      phone: "+84917778899",
      email: "pham.hung7@example.com",
      password: "password",
      password_hash: "",
      full_name: "Phạm Hùng",
      gender: "male",
      birthday: "1990-07-07",
      avatar_url: "https://picsum.photos/seed/user7/200",
      status: "active",
      created_at: "2025-07-07T07:07:07Z",
      updated_at: "2025-07-15T12:30:00Z"
    },
    {
      user_id: 8,
      phone: "+84919990011",
      email: "do.thi.h@example.com",
      password: "password",
      password_hash: "",
      full_name: "Đỗ Thị Hồng",
      gender: "female",
      birthday: "1993-04-04",
      avatar_url: "https://picsum.photos/seed/user8/200",
      status: "pending",
      created_at: "2025-08-20T18:45:00Z",
      updated_at: "2025-08-21T09:00:00Z"
    },
    {
      user_id: 9,
      phone: "+84912223344",
      email: "pham.k9@example.com",
      password: "password",
      password_hash: "",
      full_name: "Phạm K",
      gender: "other",
      birthday: "2002-10-10",
      avatar_url: "https://picsum.photos/seed/user9/200",
      status: "active",
      created_at: "2025-09-01T05:00:00Z",
      updated_at: "2025-09-02T05:00:00Z"
    },
    {
      user_id: 10,
      phone: "+84913334455",
      email: "truong.l10@example.com",
      password: "password",
      password_hash: "",
      full_name: "Trương Linh",
      gender: "female",
      birthday: "1982-02-25",
      avatar_url: "https://picsum.photos/seed/user10/200",
      status: "inactive",
      created_at: "2025-09-15T20:20:20Z",
      updated_at: "2025-10-01T10:10:10Z"
    }
  ]);
  

  return (
    <UserContext.Provider
      value={{
        userData, setUserData,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
