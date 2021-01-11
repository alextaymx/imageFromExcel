const fetch = require("node-fetch");
export const fetchQuery = async (query: string) => {
  return await fetch("https://dev-backend-4w4esg5kua-as.a.run.app/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: "SGFmaXphbg==",
    },
    body: JSON.stringify({
      query: query,
    }),
  }).then((res: any) => res.json());
};
