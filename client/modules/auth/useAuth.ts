import { useCallback, useMemo, useState } from "react";

import { signOut, useSession } from "next-auth/react";

type authType = "google";

export const useAuth = () => {
  const { data , status} = useSession();

  const user = useMemo(() => {
    if (!data?.user) {
      return null;
    }

    const user = Object.assign({
      id: data.user.email,
      displayName: data.user.email || data.user.name,
    }, data.user);

    return user;
  }, [data?.user]);

  const authId = useMemo(() => user?.id, [user?.id]);

  return {
    user,
    authId,
    status,
    signOut,
  };
};
