declare module "axios" {
  export interface InternalAxiosRequestConfig {
    _retry?: boolean;
  }
}

import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { authServiceApi } from "@/services/authApiService";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_END_URL;

export const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  timeout: 10000
});

type FailedRequest = {
  resolve: (value?: unknown) => void;
  reject: (reason?: any) => void;
};

let isRefreshing = false;
let failedQueue: FailedRequest[] = [];

const processQueue = (error: any, token: any = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });

  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  async (response) => {
    const message = response?.data?.errors?.[0]?.message;

    if (message === "Forbidden resource") {
      const originalRequest = response.config;

      if (!originalRequest._retry) {
        originalRequest._retry = true;
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then(() => axiosInstance(originalRequest))
            .catch((err) => Promise.reject(err));
        }

        isRefreshing = true;

        try {
          await authServiceApi.refreshToken();
          processQueue(null);
          return axiosInstance(originalRequest);
        } catch (err) {
          processQueue(err);
          return Promise.reject(err);
        } finally {
          isRefreshing = false;
        }
      }
    }

    return response;
  },

  (error: AxiosError) => {
    return Promise.reject(error);
  }
);
