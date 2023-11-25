import Head from "next/head";

export const _defaultMetadata = {
  title: "Contest",
  description: "Contest Anything",
};


export default function PageHead(props) {
  return (
    <Head>
      <title>{props.title || _defaultMetadata.title}</title>
      <meta name="description" content={props.description || _defaultMetadata.description} />
    </Head>
  );
}
