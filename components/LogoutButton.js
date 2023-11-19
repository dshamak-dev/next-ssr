import { useRouter } from "next/router.js";
import { useCallback } from "react";
import { setAuthToken } from "../api/login.api.js";

export default function LogoutButton() {
  const router = useRouter();
  
  const handleClick = useCallback(() => {
    setAuthToken(null);

    router.replace('/login');
  }, []);

  return (<a onClick={handleClick}>logout</a>);
}