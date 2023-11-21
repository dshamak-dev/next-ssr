import { useRouter } from "next/router.js";
import { useCallback, useMemo } from "react";

let prevRoute = null;

export const useNavigation = () => {
  const router = useRouter();

  const url = useMemo(() => {
    return router.asPath;
  }, [router.asPath]);

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

  const reload = useCallback(() => {
    router.reload();
  }, [router]);

  return {
    url,
    navigate,
    replace,
    push,
    redirect,
    reload,
    router
  };
};
