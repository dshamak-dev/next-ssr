import { Html, Head, Main, NextScript } from "next/document";
import React from 'react';

const _metadata = {
  title: 'Contest',
  description: 'Contest Everything!'
};

export async function generateMetadata({ params, searchParams }) {
  return {
    title: params.title || _metadata.title,
    description: params.description || _metadata.description
  };
}

export default function PageDocument(props) {
  return (
    <Html lang="en">
      <Head>
        <link rel="icon" href="/favicon.png" sizes="any" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
