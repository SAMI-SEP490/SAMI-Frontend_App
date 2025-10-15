import React, { createContext, useState } from "react";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userData, setUserData] = useState([
     {
      id: 1,
      phone: "+84901234567",
      email: "abc@gmail.com",
      password: "Thangminh1@",
      password_hash: "",
      full_name: "Nguyễn Tuấn A",
      gender: "male",
      birthday: "01-01-2002",
      avatar_url: "https://picsum.photos/seed/user1/200",
      status: "active",
      created_at: "2025-01-10T08:15:30Z",
      updated_at: "2025-06-12T10:20:00Z",
      role: "Quản lý trọ"
    },
    {
      id: 2,
      phone: "0398452345",
      email: "namprobs98@gmail.com",
      password: "4Namdota@",
      password_hash: "",
      full_name: "Lê Hữu Nam",
      gender: "male",
      birthday: "06-03-1998",
      avatar_url: "https://scontent.fhan2-3.fna.fbcdn.net/v/t39.30808-6/468258601_2912070768939991_6497323352363818347_n.jpg?_nc_cat=111&ccb=1-7&_nc_sid=a5f93a&_nc_eui2=AeHBgIC-MGs-iMYJ2aHXQvy3Fqr5YVsfhEMWqvlhWx-EQw5Z7v3oPNe7kWXi1D_m53QAFNBM8qGcF9n_CzKtwWdp&_nc_ohc=LazqaYl6UbMQ7kNvwFs4HyS&_nc_oc=Admwr1CKMJaJtOEGQ6pKEIN5sFL4Z0lA8PfiMSoHvR04-Lst4SUtwL_GLobPeBAVGrg&_nc_zt=23&_nc_ht=scontent.fhan2-3.fna&_nc_gid=yS9rMZGBjGrqJFGadocHFw&oh=00_Aff_OvQdblv9ee9C8Lu90WoeA_hnT8Yk6Fciw7XLvbW0ow&oe=68F4F439",
      status: "active",
      created_at: "2025-02-22T09:30:00Z",
      updated_at: "2025-07-01T14:05:10Z",
      role: "Người thuê trọ"
    }

  ]);

  const trueCode = "123456";
  const [userIdChangepassword, setUserIdChangepassword] = useState(null);
  const [userIdLogin, setUserIdLogin] = useState(null);

  return (
    <UserContext.Provider
      value={{
        userData, setUserData, trueCode, userIdChangepassword, setUserIdChangepassword , userIdLogin, setUserIdLogin
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
