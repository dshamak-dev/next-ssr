import { useRouter } from "next/router.js";
import { useCallback } from "react";

let prevRoute = null;

export const useNavigation = () => {
  const router = useRouter();

  const replace = useCallback((path) => {
    router.replace(path);
  }, [router]);

  const push = useCallback((path) => {
    router.push(path);
  }, [router]);

  const navigate = useCallback((path, withRedirect = false) => {
    prevRoute = withRedirect ? router.asPath : null;

    push(path);
  }, [router]);

  const redirect = useCallback((path) => {
    if (prevRoute != null) {
      replace(prevRoute);
      return;
    }

    navigate(path, false);
  }, [router]);

  return {
    navigate,
    replace,
    push,
    redirect,
    router
  };
};
