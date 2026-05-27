import { apiRequest } from "@/api";
import {
  LOGIN_QUERY,
  SIGNUP_QUERY,
  VERIFY_EMAIL_QUERY,
  FORGOT_PASSWORD,
  VERIFY_RESET_TOKEN,
  VERIFY_RESET_PASSWORD,
  LOGOUT_USER_MUTATION,
  REFRESH_TOKEN,
  GOOGLE_AUTH
} from "@/graphql/queries/auth";

export const authServiceApi = {
  login: async (variables: { input: { email: string; password: string } }) => {
    return apiRequest({ ...LOGIN_QUERY, variables }, "auth:login");
  },

  signup: async (variables: { input: { fullName: string; email: string; role: string; password: string } }) => {
    return apiRequest({ ...SIGNUP_QUERY, variables }, "auth:signup");
  },

  verifyEmail: async (variables: { input: { token: string } }) => {
    return apiRequest({ ...VERIFY_EMAIL_QUERY, variables }, "auth:verifyEmail");
  },

  forgotPassword: async (variables: { input: { email: string } }) => {
    return apiRequest({ ...FORGOT_PASSWORD, variables }, "auth:forgotPassword");
  },

  verifyResetToken: async (variables: { input: { token: string } }) => {
    return apiRequest({ ...VERIFY_RESET_TOKEN, variables }, "auth:verifyResetToken");
  },

  resetPassword: async (variables: { input: { password: string } }) => {
    return apiRequest({ ...VERIFY_RESET_PASSWORD, variables }, "auth:resetPassword");
  },

  logout: async () => {
    return apiRequest({ ...LOGOUT_USER_MUTATION }, 'user:logout')
  },

  refreshToken: async () => {
    return apiRequest({ ...REFRESH_TOKEN }, 'auth:refresh_token')
  },

  googleAuth: async (variables: { input: { fullName: string, email: string, role: string, googleId: string } }) => {
    return apiRequest({ ...GOOGLE_AUTH, variables })
  }
};
