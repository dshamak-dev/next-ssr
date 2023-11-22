export default function GamePage({ id }) {
  const gamerId = Date.now();

  return <main>
    <h1>Game Page #{id}</h1>

    <script defer src="http://localhost:3001/bidon.js?company=23ed84" player={gamerId}></script>
  </main>
}

export function getServerSideProps({ params = {} }) {
  return {
    props: {
      ...params
    }
  }
}