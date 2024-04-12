import { createContext, useContext } from "react";
import { TiagoUser } from "./shared/user";

// @ts-ignore

export const UserInfoContext = createContext<[TiagoUser, (u: TiagoUser) => void]>(null);

const useUserInfo = () => {
  return useContext(UserInfoContext);
};

export default useUserInfo;