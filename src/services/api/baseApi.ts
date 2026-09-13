import axiosInstance from "./axiosInstance";
import type { ID } from "#/types/common.ts";

export const baseApi = {
  getAll: async <T>(endpoint: string): Promise<T[]> => {
    const response = await axiosInstance.get<T[]>(endpoint);
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
  update: async <T>(endpoint: string, id: ID, data: Partial<T>): Promise<T> => {
    const response = await axiosInstance.patch<T>(`${endpoint}/${id}`, data);
    return response.data;
  },
  delete: async (endpoint: string, id: ID): Promise<void> => {
    await axiosInstance.delete(`${endpoint}/${id}`);
  },
};
