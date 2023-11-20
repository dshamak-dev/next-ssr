import { useState } from "react";

export default function SessionUser({ session, id }) {
  const [busy, setBusy] = useState(false);

  return (
    <div>
      <span>{id}</span>
    </div>
  );
}
