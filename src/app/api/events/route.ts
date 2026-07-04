import { sseEmitter } from "@/lib/sse";
import { startSimulator } from "@/lib/simulator";
import type { SSEEvent } from "@/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Ensure simulator is running
startSimulator();

export async function GET() {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection event
      const connectEvent: SSEEvent = {
        type: "connected",
        data: { message: "SSE connected" },
        timestamp: new Date().toISOString(),
      };
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify(connectEvent)}\n\n`)
      );

      // Subscribe to SSE events
      const unsubscribe = sseEmitter.subscribe((event) => {
        try {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(event)}\n\n`)
          );
        } catch (e) {
          // Stream closed
          unsubscribe();
        }
      });

      // Heartbeat every 30 seconds to keep connection alive
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: heartbeat\n\n`));
        } catch {
          clearInterval(heartbeat);
          unsubscribe();
        }
      }, 30000);

      // Cleanup on stream cancel
      const cleanup = () => {
        unsubscribe();
        clearInterval(heartbeat);
      };

      // Access the cancel method if available
      return cleanup;
    },
    cancel() {
      // Cleanup handled in start's return
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
