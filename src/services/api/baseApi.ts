import axiosInstance from "#/services/api/axiosInstance.ts";
import type { DeepPartial, ID } from "#/types";
import type { AxiosRequestConfig } from "axios";

function omitUndefined<T>(data: T): T {
  return Object.fromEntries(
    Object.entries(data as Record<string, unknown>).filter(
      ([, value]) => value !== undefined,
    ),
  ) as T;
}

export const baseApi = {
  getAll: async <T>(
    endpoint: string,
    params?: Record<string, string | number | boolean>,
    signal?: AbortSignal,
  ): Promise<T[]> => {
    const config: AxiosRequestConfig = { params };
    if (signal) config.signal = signal;
    return axiosInstance.get<T[]>(endpoint, config).then((res) => res.data);
  },
  getById: async <T>(endpoint: string, id: ID): Promise<T> => {
    return axiosInstance.get<T>(`${endpoint}/${id}`).then((res) => res.data);
  },
  create: async <T>(endpoint: string, data: Omit<T, "id">): Promise<T> => {
    return axiosInstance
      .post<T>(endpoint, omitUndefined(data))
      .then((res) => res.data);
  },
  update: async <T>(
    endpoint: string,
    id: ID,
    data: DeepPartial<T>,
  ): Promise<T> => {
    return axiosInstance
      .patch<T>(`${endpoint}/${id}`, omitUndefined(data))
      .then((res) => res.data);
  },
  delete: async (endpoint: string, id: ID): Promise<void> => {
    await axiosInstance.delete(`${endpoint}/${id}`);
  },
  nullifyDependents: async <T extends { id: ID }>(
    childEndpoint: string,
    filterParams: Record<string, string | number | boolean>,
    field: string,
    label: string,
  ): Promise<void> => {
    const dependents = await baseApi.getAll<T>(childEndpoint, filterParams);
    const errors: string[] = [];

    await Promise.all(
      dependents.map(async (item) => {
        try {
          await baseApi.update<T>(childEndpoint, item.id, {
            [field]: null,
          } as DeepPartial<T>);
        } catch (err) {
          errors.push(
            `حذف وابستگی ${label} با خطا مواجه شد: ${
              err instanceof Error ? err.message : "خطای نامشخص"
            }`,
          );
        }
      }),
    );

    if (errors.length > 0) {
      throw new Error(errors.join("; "));
    }
  },
  deleteDependents: async <T extends { id: ID }>(
    childEndpoint: string,
    filterParams: Record<string, string | number | boolean>,
    label: string,
  ): Promise<void> => {
    const dependents = await baseApi.getAll<T>(childEndpoint, filterParams);
    const errors: string[] = [];

    await Promise.all(
      dependents.map(async (item) => {
        try {
          await baseApi.delete(childEndpoint, item.id);
        } catch (err) {
          errors.push(
            `حذف وابستگی ${label} با خطا مواجه شد: ${
              err instanceof Error ? err.message : "خطای نامشخص"
            }`,
          );
        }
      }),
    );

    if (errors.length > 0) {
      throw new Error(errors.join("; "));
    }
  },
};