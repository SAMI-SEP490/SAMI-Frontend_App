import { GuestRegistrationProvider } from "./GuestRegistrationContext";
import { UserProvider } from "./UserContext";
import { BillProvider } from "./BillContext";
import { NotificationProvider } from "./NotificationContext";
export const RootProvider = ({ children }) => (
  <NotificationProvider>
    <BillProvider>
      <GuestRegistrationProvider>
        <UserProvider>{children}</UserProvider>
      </GuestRegistrationProvider>
    </BillProvider>
  </NotificationProvider>
);
