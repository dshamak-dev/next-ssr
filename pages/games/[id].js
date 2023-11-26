import { useCallback, useEffect, useMemo, useState } from "react";
import { get, getAPIDomain, post, put } from "../../api/api.model.js";
import { useApi } from "../../support/useApi.js";
import Form from "../../components/Form.js";
import Input from "../../components/Input.js";
import Button from "../../components/Button.js";
import Link from "next/link.js";
import { useRecord } from "../../support/useRecord.js";
import { addGamesHistory } from "../../support/game.utils.js";

const getStorage = () => {
  return localStorage;
};

const STORAGE_KEY = "_player_id";
const COMPANY_ID = "the_lime_pen";

const getCachedPlayer = () => {
  return getStorage().getItem(STORAGE_KEY);
};

const setCachedPlayer = (playerId) => {
  return getStorage().setItem(STORAGE_KEY, playerId);
};

export default function GamePage({ id, defaultState, apiDomain }) {
  const [playerId, setPlayerId] = useState(null);
  const [connectionFailed, setConnectionFailed] = useState(false);
  const [loadingGame, game, error, request, reset, forseData] = useApi(
    (playerId, props) =>
      get(apiDomain, `games/${id}/listen?playerId=${playerId}`, props),
    true,
    defaultState
  );
  const [gameState, setGameState] = useState(defaultState);
  const memo = useRecord({});

  useEffect(() => {
    setPlayerId(getCachedPlayer());
    addGamesHistory(id);
  }, []);

  const handleJoin = useCallback(
    (playerId) => {
      setCachedPlayer(playerId);
      setPlayerId(playerId);

      post(
        apiDomain,
        `games/${id}/players`,
        null,
        JSON.stringify({ id: playerId })
      );
    },
    [id, apiDomain]
  );

  const handleSetNumber = useCallback(
    (value) => {
      post(
        apiDomain,
        `games/${id}/${playerId}`,
        null,
        JSON.stringify({ value })
      );
    },
    [id, apiDomain, playerId]
  );

  const handleSetReadyState = useCallback(
    (ready = false) => {
      put(
        apiDomain,
        `games/${id}/players/${playerId}/ready`,
        null,
        JSON.stringify({ ready })
      );
    },
    [id, apiDomain, playerId]
  );

  const handleListen = useCallback(() => {
    if (memo.controller?.abort) {
      memo.controller.abort();
    }

    const controller = (memo.controller = new AbortController());

    request(playerId, { signal: controller.signal })
      .then((res) => {
        if ([404].includes(res.status)) {
          throw new Error({ error: "not found" });
        }

        try {
          return res.json();
        } catch (err) {
          console.info(err);
          return res;
        }
      })
      .then((res) => {
        handleListen();

        setGameState(res);

        return res;
      })
      .catch((err) => {
        const errorMessage = err.message;

        console.warn({ err });

        if (
          ["Unexpected token", "Failed to fetch"].some((text) =>
            errorMessage.toLowerCase().includes(text.toLowerCase())
          )
        ) {
          setConnectionFailed(true);
          return null;
        }

        // handleListen();
        return null;
      })
      .finally(() => {
        memo.controller = null;
      });
  }, [playerId]);

  const handleConnect = useCallback(async () => {
    setConnectionFailed(false);

    const data = await get(apiDomain, `games/${id}?playerId=${playerId}`, null)
      .then((res) => res.json())
      .catch((err) => {
        console.log({ err });
        return null;
      });

    setGameState(data);

    if (!["closed"].includes(data?.status)) {
      handleListen();
    }
  }, [id, playerId, handleListen]);

  useEffect(() => {
    handleConnect();
  }, [playerId]);

  const playersListContent = useMemo(() => {
    if (connectionFailed) {
      return null;
    }

    if (!["draft", "loading"].includes(gameState?.status)) {
      return null;
    }

    let _players = gameState?.players || [];

    if (!_players.length) {
      return null;
    }

    _players = _players.map((id) => {
      const _state = (gameState.state ? gameState.state[id] : null) || {};

      return {
        ..._state,
        id,
      };
    });

    return (
      <div className="flex gap-1 p-1 border-1 between text-xs wrap">
        {_players.map(({ id, ready }) => {
          return (
            <div key={id} className="flex p-1 border-1">
              <span>{id}:</span>
              <span>{ready ? "ready" : "pending"}</span>
            </div>
          );
        })}
      </div>
    );
  }, [connectionFailed, gameState?.players, gameState?.state]);

  const content = useMemo(() => {
    // console.info(game);

    if (connectionFailed) {
      return (
        <button
          onClick={() => {
            handleConnect();
          }}
        >
          Ooops. Connection Failed. Reconnect?
        </button>
      );
    }

    const connected = !!gameState?.connected;
    const pendingReady = !gameState?.ready;

    switch (gameState?.status) {
      case "active": {
        return (
          <div>
            <Form
              fields={["number"]}
              onSubmit={({ number }) => handleSetNumber(number)}
              className="flex col gap-1"
            >
              <Input
                required
                id="number"
                name="number"
                type="number"
                min={gameState.minValue}
                max={gameState.maxValue}
                placeholder="Input Number"
                className="border-1"
              />
              <Button>Submit</Button>
            </Form>
          </div>
        );
      }
      case "pending": {
        return (
          <div className="flex col gap-1">
            <h3>Your Number - {gameState?.number}</h3>
            <h4>waiting for opponents...</h4>
          </div>
        );
      }
      case "closed":
      case "finish": {
        return (
          <div className="flex col gap-1">
            <div className="flex col gap-1 items-center">
              <b>Numbers:</b>
              <p className="flex gap-2">
                {Object.entries(gameState.state)?.map(([id, { number }]) => {
                  return <span key={id}>{number}</span>;
                })}
              </p>
            </div>

            <div className="flex gap-1 items-center">
              <span>You</span> <h2>{gameState.winState ? "WON" : "LOST"}</h2>
              <span>with</span> <b>{gameState.number}</b>
            </div>
            <h4>{gameState.values}</h4>
          </div>
        );
      }
      case "loading": {
        return (
          <>
            <h3>Coffee time! Preparing stuff...</h3>
          </>
        );
      }
      case "guest": {
        return (
          <>
            <h3 className="w-full">Game is running</h3>
            <p className="w-full">You can view only</p>
          </>
        );
      }
      case "join":
      case "draft": {
        return (
          <>
            <h2 className="w-full">
              <Link href={`/games/${id}`}>
                Game Room <b>#{id}</b>
              </Link>
            </h2>
            <h3 className="w-full">Game is about to start soon</h3>
            <div className="border-1 p-1 w-min">
              {connected && pendingReady ? (
                <Button
                  primary
                  onClick={() => {
                    handleSetReadyState(true);
                  }}
                >
                  Ready?
                </Button>
              ) : connected ? null : (
                <Form
                  fields={["id"]}
                  className="flex col gap-1"
                  onSubmit={({ id }) => handleJoin(id)}
                >
                  <Input
                    required
                    id="id"
                    name="id"
                    defaultValue={playerId}
                    placeholder="Your Player ID"
                  />
                  <Button>Join</Button>
                </Form>
              )}
            </div>
          </>
        );
      }
      default: {
        return <p>Loading Game</p>;
      }
    }
  }, [handleConnect, connectionFailed, gameState]);

  useEffect(() => {
    if (playerId == null || gameState == null) {
      return;
    }

    try {
      if (window.Contest == null) {
      } else if (["draft", "loading"].includes(gameState?.status)) {
        const parsePath = (path) => {
          const parts = path.split("/");

          const connectionId = parts.slice(-1)[0];

          return { parts, connectionId };
        };

        const { connectionId } = parsePath(location.pathname);

        window.Contest.connect(connectionId, playerId);
        window.Contest.show();
      } else {
        window.Contest.hide();
      }
    } catch (err) {}

    return () => {
      try {
        window.Contest?.hide();
      } catch (err) {}
    };
  }, [playerId, gameState]);

  return (
    <main className="w-full p-1 flex col gap-2 items-center">
      <Link href="/games" className="w-full">
        go home
      </Link>
      <div className="w-full flex col gap-1">
        <h3>Rules:</h3>
        <p>
          Pick a number between {gameState?.minValue || 0} and{" "}
          {gameState?.maxValue || "?"}.
        </p>
        <div>
          <p>
            <b>YOU WIN</b> IF
          </p>
          <ul>
            <li>your number is the greates</li>
          </ul>
        </div>
        <div>
          <p>
            <b>YOU LOSE</b> IF
          </p>
          <ul>
            <li>your number equal to other player</li>
          </ul>
        </div>
        {gameState?.message ? <p>{gameState.message}</p> : null}
      </div>
      {playersListContent}
      <div className="flex col w-full items-center gap-1">{content}</div>
      <script
        fetchpriority="hight"
        src={`${apiDomain}/contest/client?company=${COMPANY_ID}`}
      ></script>
    </main>
  );
}

export async function getServerSideProps({ params = {} }) {
  const apiDomain = getAPIDomain();
  const gameId = params?.id;

  await post(
    apiDomain,
    `games`,
    null,
    JSON.stringify({
      id: gameId,
    })
  )
    .then((res) => res.json())
    .catch((err) => {
      console.log({ err });
      return null;
    });

  return {
    props: {
      ...params,
      apiDomain,
    },
  };
}
