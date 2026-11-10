import type { ID } from "#/types/common.ts";

export interface CascadeResult {
  entityType: string;
  success: boolean;
  errors: string[];
}

export interface CascadeReport {
  overallSuccess: boolean;
  results: CascadeResult[];
}

export type DependencyMap = Record<string, ID[]>;
