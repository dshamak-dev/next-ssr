import User from "../components/User.js";
import styles from '../styles/Bets.module.scss';

export const Bets = ({ users }) => {
  return (<div>
    <h1>BETS</h1>
    <div className={styles.betlist}>{users?.map((user) => (<User key={user.id} {...user} />))}</div>
  </div>);
};

export default Bets;

export async function getStaticProps(context) {
  const response = await fetch(`https://jsonplaceholder.typicode.com/users/`);
  const users = await response?.json() || [];

  return {
    props: { users }
  };
}