import { GuestRegistrationProvider } from "./GuestRegistrationContext";
import { UserProvider } from "./UserContext";
export const RootProvider = ({ children }) => (
  <GuestRegistrationProvider><UserProvider>{children}</UserProvider></GuestRegistrationProvider>
);
