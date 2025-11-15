import { GuestRegistrationProvider } from "./GuestRegistrationContext";
import { UserProvider } from "./UserContext";
import { BillProvider } from "./BillContext";
import { NotificationProvider } from "./NotificationContext";
import { VehicleProvider } from "../screens/vehicle/VehicleContext";
export const RootProvider = ({ children }) => (
  <NotificationProvider>
    <BillProvider>
      <GuestRegistrationProvider>
        <UserProvider><VehicleProvider>{children}</VehicleProvider></UserProvider>
      </GuestRegistrationProvider>
    </BillProvider>
  </NotificationProvider>
);
