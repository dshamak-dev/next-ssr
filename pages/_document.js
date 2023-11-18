import { Html, Head, Main, NextScript } from "next/document";

export async function generateMetadata({ params, searchParams }) {
  return {
    title: params.title || metadata.title,
    description: params.description || metadata.description
  };
}

export default function PageDocument(props) {
  return (
    <Html lang="en">
      <Head>
        <link rel="icon" href="/favicon.png" sizes="any" />
        <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" />
        <link rel="icon" href="/favicon.ico" type="image/x-icon"></link>
      </Head>
      <body>
        <Main>{props.children}</Main>
        <NextScript />
      </body>
    </Html>
  );
}
