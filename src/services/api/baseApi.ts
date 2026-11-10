import axiosInstance from "#/services/api/axiosInstance.ts";
import { requestTracker } from "#/services/api/requestTracker.ts";
import type { DeepPartial, ID } from "#/types/common.ts";
import type { AxiosRequestConfig } from "axios";

export const baseApi = {
  getAll: async <T>(
    endpoint: string,
    params?: Record<string, string | number | boolean>,
    signal?: AbortSignal,
  ): Promise<T[]> => {
    const { promise } = requestTracker.acquire(
      "get",
      endpoint,
      (trackerSignal) => {
        const config: AxiosRequestConfig = { params };
        if (signal) config.signal = signal;
        if (trackerSignal) config.signal = trackerSignal;
        return axiosInstance.get<T[]>(endpoint, config).then((res) => res.data);
      },
    );
    return promise;
  },
  getById: async <T>(endpoint: string, id: ID): Promise<T> => {
    const { promise } = requestTracker.acquire(
      "get",
      endpoint,
      (trackerSignal) => {
        const config: AxiosRequestConfig = {};
        if (trackerSignal) config.signal = trackerSignal;
        return axiosInstance.get<T>(`${endpoint}/${id}`, config).then((res) => res.data);
      },
      id,
    );
    return promise;
  },
  create: async <T>(endpoint: string, data: Omit<T, "id">): Promise<T> => {
    const { promise } = requestTracker.acquire(
      "post",
      endpoint,
      (trackerSignal) => {
        const config: AxiosRequestConfig = {};
        if (trackerSignal) config.signal = trackerSignal;
        return axiosInstance.post<T>(endpoint, data, config).then((res) => res.data);
      },
    );
    return promise;
  },
  update: async <T>(
    endpoint: string,
    id: ID,
    data: DeepPartial<T>,
  ): Promise<T> => {
    const sanitizedData = Object.fromEntries(
      Object.entries(data).filter(([, value]) => value !== undefined),
    ) as DeepPartial<T>;
    const { promise } = requestTracker.acquire(
      "patch",
      endpoint,
      (trackerSignal) => {
        const config: AxiosRequestConfig = {};
        if (trackerSignal) config.signal = trackerSignal;
        return axiosInstance.patch<T>(
          `${endpoint}/${id}`,
          sanitizedData,
          config,
        ).then((res) => res.data);
      },
      id,
    );
    return promise;
  },
  delete: async (endpoint: string, id: ID): Promise<void> => {
    const { promise } = requestTracker.acquire(
      "delete",
      endpoint,
      (trackerSignal) => {
        const config: AxiosRequestConfig = {};
        if (trackerSignal) config.signal = trackerSignal;
        return axiosInstance.delete(`${endpoint}/${id}`, config).then(() => undefined);
      },
      id,
    );
    return promise;
  },
};
