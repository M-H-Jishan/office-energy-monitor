import type { SSEEvent } from "@/types";

type Listener = (event: SSEEvent) => void;

class SSEEmitter {
  private listeners: Set<Listener> = new Set();

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  emit(event: SSEEvent): void {
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (e) {
        console.error("SSE listener error:", e);
      }
    }
  }

  get listenerCount(): number {
    return this.listeners.size;
  }
}

const globalForSSE = globalThis as unknown as { sseEmitter: SSEEmitter | undefined };

export const sseEmitter = globalForSSE.sseEmitter ?? new SSEEmitter();

if (process.env.NODE_ENV !== "production") globalForSSE.sseEmitter = sseEmitter;
