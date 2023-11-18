import Link from "next/link.js";

export default function User(props) {
  return (<div>
    <Link href={`/users/${props.id}`}>{props.name}</Link>
  </div>);
}