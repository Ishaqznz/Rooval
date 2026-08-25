import { axiosInstance } from "./lib/axiosInstance";
import { GraphQLQuery } from "./interfaces/common/graphql";

export async function apiRequest(query: GraphQLQuery, requestType: string = "default") {

  if (query.formData) {
    const response = await axiosInstance.post("", query.formData, {
      headers: {
        "apollo-require-preflight": "true",
        "Content-Type": "multipart/form-data"
      },
    });

    return response.data;
  }

  const response = await axiosInstance.post(
    "",
    {
      query: query.query,
      variables: query.variables,
    },
  );

  return response.data;
}
