import { useCallback, useState } from "react";

type authType =  'google';

export const useAuth = () => {
  const [user, setUser] = useState(undefined);
  const [loading, setLoading] = useState(false);

  const signIn = useCallback((type: authType) => {
    setUser({ fullName: 'John Doe', email: 'j.doe@gmail.com' });
  }, []);
  const signOut = useCallback(() => {
    setUser(undefined);
  }, []);

  return {
    loading,
    user,
    signIn,
    signOut
  };
};
