import Link from "next/link.js";
import { useEffect, useState } from "react";
import Button from "../components/Button.js";
import { generateId } from "../support/fabric.utils.js";
import { useNavigation } from "../support/useNavigation.js";
import { getGamesHistory } from "../support/game.utils.js";
import { getAPIDomain } from "../api/api.model.js";

const COMPANY_ID = "the_lime_pen";

export default function GamesPage({ apiDomain }) {
  const [history, setHistory] = useState([]);
  const { navigate } = useNavigation();

  useEffect(() => {
    setHistory(getGamesHistory() || []);
  }, []);

  return (
    <main className="p-1 flex col gap-2">
      <div>
        <Link href="/">to main</Link>
      </div>
      <h1>Number Game</h1>
      <div className="flex between">
        <Button
          onClick={() => {
            const id = generateId();

            navigate(`/games/${id}`);
          }}
        >
          Create New Room
        </Button>
      </div>
      {history?.length ? (
        <div className="flex col gap-1">
          <h4>Visited</h4>
          <div className="flex col gap-1">
            {history.map((id) => {
              return (
                <Link key={id} href={`/games/${id}`}>
                  #{id}
                </Link>
              );
            })}
          </div>
        </div>
      ) : null}
    </main>
  );
}

export async function getServerSideProps({ params = {} }) {
  const apiDomain = getAPIDomain();

  return {
    props: {
      ...params,
      apiDomain,
    },
  };
}
