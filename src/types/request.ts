export type RequestStatus = "pending" | "completed" | "failed";

export interface InFlightRequest {
  key: string;
  endpoint: string;
  method: string;
  id: string | undefined;
  status: RequestStatus;
  startedAt: number;
  promise: Promise<unknown>;
  abortController: AbortController;
}

export interface RequestTrackerOptions {
  /** Maximum time (ms) a request can stay in-flight before being considered stale. */
  staleTimeoutMs?: number;
}
