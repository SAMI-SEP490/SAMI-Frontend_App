import { GuestRegistrationProvider } from "./GuestRegistrationContext";
import { UserProvider } from "./UserContext";
import { BillProvider } from "./BillContext";
export const RootProvider = ({ children }) => (
  <BillProvider>
    <GuestRegistrationProvider>
      <UserProvider>{children}</UserProvider>
    </GuestRegistrationProvider>
  </BillProvider>
);
