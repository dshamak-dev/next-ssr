import { useCallback, useMemo } from "react";
import Form from "./Form.js";
import Input from "./Input.js";
import Button from "./Button.js";

export const SessionResolveForm = ({ onSubmit, users }) => {
  const userIdList = useMemo(() => {
    return users.map((it) => it.id);
  }, [users]);

  const handleSubmit = useCallback((fields) => {
    const _users = Object.entries(fields).reduce((_all, [id, value]) => {
      return [..._all, { id, state: value === 'on' }];
    }, []);

    onSubmit({ users: _users });
  }, [onSubmit, userIdList]);

  return (
    <Form onSubmit={handleSubmit} fields={userIdList} className="flex col gap-3">
      <div>
        <h2>Select winner(s)</h2>
      </div>
      <div className="flex col gap-1">
        {users.map(({ id, name }) => (
          <div key={id} className="user-option flex between gap-1">
            <label htmlFor={id}>{name}</label>
            <Input id={id} name={id} type="checkbox" className="w-fit" />
          </div>
        ))}
      </div>
      <div>
        <Button primary>Resolve</Button>
      </div>
      <style jsx>{`
        .user-option {
          padding: 0.5rem;
          background-color: #f4f4f4;

          & label {
            flex-grow: 1;
            cursor: pointer;
          }
        }
      `}</style>
    </Form>
  );
};
