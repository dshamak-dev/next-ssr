import User from "../../components/User.js";
import { getUser } from "../../api/user.api.js";
import LogoutButton from "../../components/LogoutButton.js";
import { getAPIDomain } from "../../api/api.model.js";

export default function UserPage({ user, apiDomain }) {
  return (
    <div>
      <div>
        <LogoutButton />
      </div>
      <div>{user == null ? <h2>No user data</h2> : <User {...user} apiDomain={apiDomain}  />}</div>
    </div>
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
