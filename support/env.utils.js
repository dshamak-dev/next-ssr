export const getEnvironmentProps = () => {
  let apiDomain = "/";

  try {
    apiDomain = process.env.API_DOMAIN;
  } catch (err) {}

  console.log({apiDomain});

  return { apiDomain };
};
