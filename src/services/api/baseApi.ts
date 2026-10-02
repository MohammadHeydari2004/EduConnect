import type { DeepPartial, ID } from "#/types/common.ts";
import axiosInstance from "./axiosInstance";

export const baseApi = {
  getAll: async <T>(
    endpoint: string,
    params?: Record<string, string | number | boolean>,
  ): Promise<T[]> => {
    const response = await axiosInstance.get<T[]>(endpoint, { params });
    return response.data;
  },
  getById: async <T>(endpoint: string, id: ID): Promise<T> => {
    const response = await axiosInstance.get<T>(`${endpoint}/${id}`);
    return response.data;
  },
  create: async <T>(endpoint: string, data: Omit<T, "id">): Promise<T> => {
    const response = await axiosInstance.post<T>(endpoint, data);
    return response.data;
  },
  update: async <T>(
    endpoint: string,
    id: ID,
    data: DeepPartial<T>,
  ): Promise<T> => {
    const sanitizedData = Object.fromEntries(
      Object.entries(data).filter(([, value]) => value !== undefined),
    ) as DeepPartial<T>;
    const response = await axiosInstance.patch<T>(
      `${endpoint}/${id}`,
      sanitizedData,
    );
    return response.data;
  },
  delete: async (endpoint: string, id: ID): Promise<void> => {
    await axiosInstance.delete(`${endpoint}/${id}`);
  },
};
