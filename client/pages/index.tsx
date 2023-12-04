import React, { useCallback } from "react";
import { ButtonView as Button } from "../modules/button/ButtonView";
import { LinkView as Link } from "../modules/link/LinkView";
import { useRouter } from "next/router";

export const IndexPage = () => {
  const { push } = useRouter();

  const handleCreateSession = useCallback(() => {
    push('/session');
  }, []);

  return (
    <main className="flex col gap-3 between">
      <h1 className="capitalize text-lg">
        create / join
        <br />
        <span className="highlight">Contest</span> &<br />
        <span className="highlight">become</span> a<br />
        <span className="highlight">winner</span>
      </h1>
      <div className="controls flex col gap-1 grow-1">
        <Button onClick={handleCreateSession}>Create</Button>
        <Button primary>Join</Button>
      </div>
      <div className="controls flex col gap-1">
        <Link
          href="/profile"
          className="flex items-center justify-center rounded-full"
          style={{ width: "40vw", height: "40vw", margin: "0 auto", background: 'var(--black)' }}
        >
          Profile
        </Link>
      </div>
      <div className="circle"></div>
      <style jsx>{`
        main {
          height: 100vh;
          height: 100dvh;
          padding: 3rem 2rem;

          color: var(--white);
          background: var(--black);
        }

        .highlight {
          color: var(--red);
        }

        .controls {
          position: relative;
          z-index: 1;
        }

        .circle {
          position: fixed;
          bottom: 0;
          left: -5vw;
          z-index: 0;
          width: 110vw;
          height: calc(30vh + 2rem);
          height: calc(30dvh + 2rem);
          background-color: var(--red);
          border-radius: 30vh 30vh 0 0;
        }
      `}</style>
    </main>
  );
};

export default IndexPage;
