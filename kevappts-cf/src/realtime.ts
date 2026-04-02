/**
 * Durable Object: RealtimeHub
 * Manages SSE connections for real-time slot updates.
 * Replaces the 30-second polling with instant push notifications.
 */
export class RealtimeHub {
  private connections: Map<string, WritableStreamDefaultWriter> = new Map();
  private state: DurableObjectState;

  constructor(state: DurableObjectState) {
    this.state = state;
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    // SSE connection endpoint
    if (url.pathname === '/connect') {
      const { readable, writable } = new TransformStream();
      const writer = writable.getWriter();
      const id = crypto.randomUUID();

      // Send initial connection message
      const encoder = new TextEncoder();
      await writer.write(encoder.encode('data: {"type":"connected"}\n\n'));

      this.connections.set(id, writer);

      // Clean up on close
      request.signal.addEventListener('abort', () => {
        this.connections.delete(id);
        try { writer.close(); } catch {}
      });

      return new Response(readable, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Broadcast endpoint (called by API after mutations)
    if (url.pathname === '/broadcast' && request.method === 'POST') {
      const body = await request.text();
      const encoder = new TextEncoder();
      const message = `data: ${body}\n\n`;
      const encoded = encoder.encode(message);

      const dead: string[] = [];
      for (const [id, writer] of this.connections) {
        try {
          await writer.write(encoded);
        } catch {
          dead.push(id);
        }
      }

      // Clean up dead connections
      for (const id of dead) {
        this.connections.delete(id);
      }

      return new Response(JSON.stringify({ ok: true, clients: this.connections.size }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Status endpoint
    if (url.pathname === '/status') {
      return new Response(JSON.stringify({ connections: this.connections.size }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response('Not Found', { status: 404 });
  }
}
