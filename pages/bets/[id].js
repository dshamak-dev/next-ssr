import { useRouter } from "next/router.js";

export const BetSession = () => {
  const router = useRouter();

  const id = router.query.id;

  return (<div>Bet Session {id}</div>);
};

export default BetSession;