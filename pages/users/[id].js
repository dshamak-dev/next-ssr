import User from "../../components/User.js";
import { getUser } from "../../api/user.api.js";
import LogoutButton from "../../components/LogoutButton.js";

export default function UserPage({ user }) {
  return (
    <div>
      <div><LogoutButton /></div>
      <div>{user == null ? <h2>No user data</h2> : <User {...user} />}</div>
    </div>
  );
}

export async function getServerSideProps({ params }) {
  const id = params?.id;

  try {
    const user = await getUser(id);

    return {
      props: { user },
    };
  } catch (err) {
    return {
      props: { user: null },
    };
  }
}
