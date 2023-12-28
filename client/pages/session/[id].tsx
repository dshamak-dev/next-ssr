import { ProfileNavigation } from "../../modules/navigation/ProfileNavigation";
import { ContestSessionProvider } from "../../modules/session/sessionContext";
import { Session } from "../../modules/session/Session";

export default function SessionPage({ id }) {
  return (
    <main className="session-page">
      <ProfileNavigation backUrl="/" />
      <ContestSessionProvider id={id}><Session /></ContestSessionProvider>
      <style jsx>{`
        .session-page {
          display: grid;
          grid-template-rows: auto 1fr;
        }
      `}</style>
    </main>
  );
}

export const getServerSideProps = async (context) => {
  const { id } = context.params;

  return { props: { id } };
};
