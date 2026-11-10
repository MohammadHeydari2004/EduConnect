import type {
  InFlightRequest,
  RequestTrackerOptions,
} from "#/types/request.ts";
import { ApiError } from "#/services/api/axiosInstance.ts";

const WRITE_METHODS = new Set(["post", "put", "patch", "delete"]);

function buildKey(
  method: string,
  endpoint: string,
  id?: string,
): string {
  const normalizedMethod = method.toLowerCase();
  const normalizedEndpoint = endpoint.replace(/\/$/, "");
  return `${normalizedMethod}:${normalizedEndpoint}${id ? `:${id}` : ""}`;
}

function isWriteMethod(method: string): boolean {
  return WRITE_METHODS.has(method.toLowerCase());
}

export class RequestTracker {
  private readonly inFlight = new Map<string, InFlightRequest>();
  private readonly options: Required<RequestTrackerOptions>;

  constructor(options: RequestTrackerOptions = {}) {
    this.options = {
      staleTimeoutMs: options.staleTimeoutMs ?? 30000,
    };
  }

  /** Returns a release function. For GET requests, dedups identical in-flight calls.
   * For write requests, serializes concurrent calls to the same key, rejecting
   * duplicates with a 409 ApiError to prevent race conditions. */
  acquire<T>(
    method: string,
    endpoint: string,
    requestFn: (signal: AbortSignal) => Promise<T>,
    id?: string,
  ): { release: () => void; promise: Promise<T> } {
    const normalizedMethod = method.toLowerCase();
    const key = buildKey(normalizedMethod, endpoint, id);
    const now = Date.now();

    const existing = this.inFlight.get(key);

    if (existing) {
      const age = now - existing.startedAt;
      if (age > this.options.staleTimeoutMs) {
        this.abortExisting(existing);
        this.inFlight.delete(key);
      } else if (isWriteMethod(normalizedMethod)) {
        throw new ApiError({
          userMessage: "در حال پردازش درخواست قبلی، لطفاً صبر کنید.",
          status: 409,
          code: "REQUEST_IN_FLIGHT",
          originalError: new Error("Duplicate write request in flight"),
          url: endpoint,
        });
      } else {
        // GET dedup: return the same in-flight promise
        return {
          release: () => {
            this.release(key);
          },
          promise: existing.promise as Promise<T>,
        };
      }
    }

    const controller = new AbortController();
    const promise = requestFn(controller.signal).then(
      (data) => {
        this.markCompleted(key);
        return data;
      },
      (error) => {
        this.markFailed(key);
        throw error;
      },
    );

    const inFlight: InFlightRequest = {
      key,
      endpoint,
      method: normalizedMethod,
      id,
      status: "pending",
      startedAt: now,
      promise,
      abortController: controller,
    };

    this.inFlight.set(key, inFlight);

    return {
      release: () => {
        this.release(key);
      },
      promise,
    };
  }

  /** Abort an in-flight request (used to cancel stale requests superseded by newer ones). */
  abort(key: string): boolean {
    const request = this.inFlight.get(key);
    if (!request) return false;
    request.abortController.abort();
    this.inFlight.delete(key);
    return true;
  }

  /** Abort all in-flight requests. */
  abortAll(): number {
    const count = this.inFlight.size;
    for (const request of this.inFlight.values()) {
      request.abortController.abort();
    }
    this.inFlight.clear();
    return count;
  }

  /** Clear all tracked requests without aborting. */
  clearAll(): number {
    const count = this.inFlight.size;
    this.inFlight.clear();
    return count;
  }

  /** Get debug stats about in-flight requests. */
  getStats(): {
    total: number;
    pending: number;
    byMethod: Record<string, number>;
    oldestStartedAt: number | undefined;
  } {
    const byMethod: Record<string, number> = {};
    let pending = 0;
    let oldestStartedAt: number | undefined;

    for (const request of this.inFlight.values()) {
      byMethod[request.method] = (byMethod[request.method] || 0) + 1;
      if (request.status === "pending") pending += 1;
      if (
        oldestStartedAt === undefined ||
        request.startedAt < oldestStartedAt
      ) {
        oldestStartedAt = request.startedAt;
      }
    }

    return {
      total: this.inFlight.size,
      pending,
      byMethod,
      oldestStartedAt,
    };
  }

  /** Check if a key is currently in-flight. */
  isInFlight(key: string): boolean {
    return this.inFlight.has(key);
  }

  /** Get the in-flight request for a key, if any. */
  getInFlight(key: string): InFlightRequest | undefined {
    return this.inFlight.get(key);
  }

  private abortExisting(request: InFlightRequest): void {
    request.abortController.abort();
    this.markFailed(request.key);
  }

  private release(key: string): void {
    this.inFlight.delete(key);
  }

  private markCompleted(key: string): void {
    const request = this.inFlight.get(key);
    if (request) {
      request.status = "completed";
      this.inFlight.delete(key);
    }
  }

  private markFailed(key: string): void {
    const request = this.inFlight.get(key);
    if (request) {
      request.status = "failed";
      this.inFlight.delete(key);
    }
  }
}

export const requestTracker = new RequestTracker();

export function getRequestStats() {
  return requestTracker.getStats();
}

export function clearAllRequests() {
  return requestTracker.clearAll();
}
