import User from "../../components/User.js";
import { getUser } from "../../api/user.api.js";
import LogoutButton from "../../components/LogoutButton.js";
import { getAPIDomain } from "../../api/api.model.js";

export default function UserPage({ user, apiDomain }) {
  return (
    <>
      <div className="page-content">
        <div>
          <LogoutButton />
        </div>
        <div>
          {user == null ? (
            <h2>No user data</h2>
          ) : (
            <User user={user} apiDomain={apiDomain} />
          )}
        </div>
      </div>
      <style jsx>{`
        .page-content {
          width: 100vw;
          box-sizing: border-box;
          padding: 1rem;

          display: flex;
          flex-direction: column;
          gap: 2rem;
        }
      `}</style>
    </>
  );
}

export async function getServerSideProps({ params }) {
  const id = params?.id;
  const apiDomain = getAPIDomain();

  try {
    const user = await getUser(apiDomain, id);
    return {
      props: { user, apiDomain },
    };
  } catch (err) {
    return {
      props: { user: null, apiDomain },
    };
  }
}
