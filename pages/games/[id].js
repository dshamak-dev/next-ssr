export default function GamePage({ id }) {
  const playerId = Date.now();

  return <main>
    <h1>Game Page #{id}</h1>

    <script defer src={`https://next-ssr-sp4k.onrender.com/bidon.js?company=23ed84&player=${playerId}`}></script>
  </main>
}

export function getServerSideProps({ params = {} }) {
  return {
    props: {
      ...params
    }
  }
}