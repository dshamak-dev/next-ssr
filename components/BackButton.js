import { useRouter } from "next/router.js";
import { useCallback, useMemo } from "react";

export default function BackButton() {
  const router = useRouter();

  const hasBackHistory = useMemo(() => {
    if (!router?.components) {
      return false;
    }

    return true;
  }, [router.components]);

  const handleClick = useCallback(() => hasBackHistory ? router.back() : router.replace('/bets'), [hasBackHistory]);

  return <a onClick={handleClick}>go back</a>;
}