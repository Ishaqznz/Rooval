import { GraphQLQuery } from "./interfaces/graphql";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_END_URL as string;

export async function apiRequest(query: GraphQLQuery) {
  console.log('query of the front end: ', query)
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: query.query,
      variables: query.variables,
    }),
    credentials: "include", 
  });

  const result = await response.json();
  console.log('result in the back end: ', result)
  return result.data;
}
