import { useCallback } from "react";

export default function Form({ onSubmit, fields, children, ...other }) {
  const handleSubmit = useCallback(
    (ev) => {
      ev.preventDefault();

      const formData = new FormData(ev.target);
      const fieldsData = fields.reduce((_fields, key) => {
        return { ..._fields, [key]: formData.get(key) };
      }, {});

      onSubmit(fieldsData);
    },
    [fields, onSubmit]
  );

  return <form {...other} onSubmit={handleSubmit}>{children}</form>;
}
