import { ProfileNavigation } from "../../modules/navigation/ProfileNavigation";
import { ContestSessionProvider } from "../../modules/session/sessionContext";
import { Session } from "../../modules/session/Session";

export default function SessionPage({ id }) {
  return (
    <main>
      <ProfileNavigation backUrl="/" />
      <ContestSessionProvider id={id}><Session /></ContestSessionProvider>
    </main>
  );
}

export const getServerSideProps = async (context) => {
  const { id } = context.params;

  return { props: { id } };
};
