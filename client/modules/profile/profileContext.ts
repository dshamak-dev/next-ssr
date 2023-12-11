import { PropsWithChildren, createContext, createElement } from "react";
import { useProfile } from "./useProfile";

export const ProfileContext = createContext<any>([false, null]);

export const ProfileProvider = ({ children }) => {
  const state = useProfile();

  return createElement<PropsWithChildren<{ value: any }>>(
    ProfileContext.Provider,
    { value: state, children }
  );
};
