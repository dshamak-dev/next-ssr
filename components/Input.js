export default function Input(props) {
  return (
    <>
      <input {...props} />
      <style jsx>{`
        input {
          all: inherit;
          width: 100%;
          padding: 0.5rem;
          box-sizing: border-box;
          border: 1px solid black;
        }
      `}</style>
    </>
  );
}
