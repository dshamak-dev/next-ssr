import User from "../../components/User.js";
import BackButton from "../../components/BackButton.js";

export default function UserPage({ user }) {
  return (
    <div>
      <BackButton />
      <div>
        <User {...user} />
      </div>
    </div>
  );
}

export async function getServerSideProps({ params }) {
  const id = params?.id;

  const response = await fetch(
    `https://jsonplaceholder.typicode.com/users/${id}`
  );
  const user = (await response?.json()) || null;

  return {
    props: { user },
  };
}
