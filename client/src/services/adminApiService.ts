import { apiRequest } from "@/api";

import {
  ADMIN_LOGIN_QUERY
} from "@/graphql/queries/admin";

export const adminServiceApi = {
  login: async (variables: { input: { email: string; password: string } }) => {
    return apiRequest({ ...ADMIN_LOGIN_QUERY, variables }, "admin:login");
  }
};
