/**
 * Durable Object: RealtimeHub
 * WebSocket hub (Hibernation API) so the staff dashboard updates instantly and
 * beeps when a new order arrives. Single "global" channel — every connected
 * dashboard receives every broadcast.
 */
export class RealtimeHub {
  private state: DurableObjectState;
  constructor(state: DurableObjectState) { this.state = state; }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/ws') {
      if (request.headers.get('Upgrade') !== 'websocket') {
        return new Response('Expected WebSocket', { status: 426 });
      }
      const pair = new WebSocketPair();
      const [client, server] = Object.values(pair);
      this.state.acceptWebSocket(server, ['global']);
      server.send(JSON.stringify({ type: 'connected' }));
      return new Response(null, { status: 101, webSocket: client });
    }

    if (url.pathname === '/broadcast' && request.method === 'POST') {
      const message = await request.json() as any;
      const payload = JSON.stringify(message);
      let sent = 0;
      for (const ws of this.state.getWebSockets()) {
        try { ws.send(payload); sent++; } catch { try { ws.close(); } catch {} }
      }
      return Response.json({ ok: true, sent });
    }

    return new Response('Not Found', { status: 404 });
  }

  async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer): Promise<void> {
    try {
      const text = typeof message === 'string' ? message : new TextDecoder().decode(message);
      if (text === 'ping') ws.send(JSON.stringify({ type: 'pong' }));
    } catch {}
  }
  async webSocketClose(ws: WebSocket): Promise<void> {}
  async webSocketError(ws: WebSocket): Promise<void> { try { ws.close(); } catch {} }
}
