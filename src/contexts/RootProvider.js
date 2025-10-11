import { GuestRegistrationProvider } from "./GuestRegistrationContext";

export const RootProvider = ({ children }) => (
  <GuestRegistrationProvider>{children}</GuestRegistrationProvider>
);
