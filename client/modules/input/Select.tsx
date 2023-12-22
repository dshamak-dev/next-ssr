export const Select = ({ options, ...props }) => {
  return (
    <select {...props}>
      {options.map(({ id, text }) => {
        return (
          <option key={id} value={id}>
            {text}
          </option>
        );
      })}
    </select>
  );
};
