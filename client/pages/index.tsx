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
      <div className="profile-link">
        <Link
          href="/profile"
          className="flex items-center justify-center rounded-full"
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

        .profile-link {
          --size: 8rem;

          display: flex;
          align-items: center;
          justify-content: center;

          position: absolute;
          bottom: 1rem;
          left: calc(50% - var(--size) / 2);

          width: var(--size);
          height: var(--size);

          border-radius: var(--size);

          background: var(--black);

          z-index: 1;
        }

        .circle {
          --width: 24rem;
          --height: 12rem;

          position: absolute;
          bottom: 0;
          left: calc(50% - var(--width) / 2);
          z-index: 0;
          width: var(--width);
          height: var(--height);
          height: var(--height);
          background-color: var(--red);
          border-radius: var(--height) var(--height) 0 0;
        }
      `}</style>
    </main>
  );
};

export default IndexPage;
