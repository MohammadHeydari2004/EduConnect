export interface CascadeResult {
  entityType: string;
  success: boolean;
  errors: string[];
}

export interface CascadeReport {
  overallSuccess: boolean;
  results: CascadeResult[];
}
