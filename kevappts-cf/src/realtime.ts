/**
 * Durable Object: RealtimeHub
 *
 * WebSocket-based real-time hub using Hibernation API with TAGS.
 * Tags survive hibernation — in-memory Maps do NOT.
 *
 * Tags used:
 * - "global" — all connections (default)
 * - "admin"  — admin/doctor page connections
 * - "date:YYYY-MM-DD" — booking page watching a specific date
 */
export class RealtimeHub {
  private state: DurableObjectState;

  constructor(state: DurableObjectState) {
    this.state = state;
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    // ─── WebSocket upgrade ──────────────────────────
    if (url.pathname === '/ws') {
      if (request.headers.get('Upgrade') !== 'websocket') {
        return new Response('Expected WebSocket', { status: 426 });
      }

      const pair = new WebSocketPair();
      const [client, server] = Object.values(pair);

      // Accept with "global" tag — survives hibernation
      this.state.acceptWebSocket(server, ['global']);

      server.send(JSON.stringify({ type: 'connected' }));

      return new Response(null, { status: 101, webSocket: client });
    }

    // ─── Broadcast (called by API handlers after mutations) ─
    if (url.pathname === '/broadcast' && request.method === 'POST') {
      const message = await request.json() as any;
      const payload = JSON.stringify(message);
      let sent = 0;

      // Get ALL connected WebSockets via Hibernation API (survives hibernation!)
      const allSockets = this.state.getWebSockets();

      for (const ws of allSockets) {
        try {
          // Get this socket's tags
          const tags = this.state.getTags(ws);
          const isAdmin = tags.includes('admin');
          const isGlobal = tags.includes('global');
          const matchesDate = message.dateKey && tags.includes('date:' + message.dateKey);

          if (isAdmin || isGlobal || matchesDate || !message.dateKey) {
            ws.send(payload);
            sent++;
          }
        } catch {
          try { ws.close(); } catch {}
        }
      }

      return Response.json({ ok: true, sent, total: allSockets.length });
    }

    // ─── Push data (with full slot payload) ─
    if (url.pathname === '/push-data' && request.method === 'POST') {
      const message = await request.json() as any;
      const payload = JSON.stringify(message);
      let sent = 0;

      const allSockets = this.state.getWebSockets();

      for (const ws of allSockets) {
        try {
          const tags = this.state.getTags(ws);
          const isAdmin = tags.includes('admin');
          const matchesDate = message.dateKey && tags.includes('date:' + message.dateKey);

          if (isAdmin || matchesDate) {
            ws.send(payload);
            sent++;
          }
        } catch {
          try { ws.close(); } catch {}
        }
      }

      return Response.json({ ok: true, sent, total: allSockets.length });
    }

    // ─── Status ─────────────────────────────────────
    if (url.pathname === '/status') {
      const allSockets = this.state.getWebSockets();
      const tagCounts: Record<string, number> = {};

      for (const ws of allSockets) {
        try {
          const tags = this.state.getTags(ws);
          for (const t of tags) {
            tagCounts[t] = (tagCounts[t] || 0) + 1;
          }
        } catch {}
      }

      return Response.json({ connections: allSockets.length, tags: tagCounts });
    }

    return new Response('Not Found', { status: 404 });
  }

  // Called by the runtime when a WebSocket message arrives (survives hibernation)
  async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer): Promise<void> {
    try {
      const text = typeof message === 'string' ? message : new TextDecoder().decode(message);

      // Handle raw ping string
      if (text === 'ping') {
        ws.send(JSON.stringify({ type: 'pong' }));
        return;
      }

      const data = JSON.parse(text);

      // Subscribe to admin channel
      if (data.subscribe === 'admin') {
        // Add 'admin' tag (persists through hibernation)
        const tags = this.state.getTags(ws);
        if (!tags.includes('admin')) {
          // Re-accept with updated tags
          const newTags = [...new Set([...tags, 'admin'])];
          this.state.acceptWebSocket(ws, newTags);
        }
        ws.send(JSON.stringify({ type: 'subscribed', channel: 'admin' }));
      }

      // Subscribe to a specific date
      if (data.subscribe === 'date' && data.dateKey) {
        const tags = this.state.getTags(ws);
        const dateTag = 'date:' + data.dateKey;
        if (!tags.includes(dateTag)) {
          const newTags = [...new Set([...tags, dateTag])];
          this.state.acceptWebSocket(ws, newTags);
        }
        ws.send(JSON.stringify({ type: 'subscribed', channel: 'date', dateKey: data.dateKey }));
      }

      // Unsubscribe from a date
      if (data.unsubscribe === 'date' && data.dateKey) {
        const tags = this.state.getTags(ws);
        const dateTag = 'date:' + data.dateKey;
        const newTags = tags.filter(t => t !== dateTag);
        this.state.acceptWebSocket(ws, newTags);
      }

      // Ping/pong
      if (data.type === 'ping') {
        ws.send(JSON.stringify({ type: 'pong' }));
      }
    } catch {
      // Invalid message — ignore
    }
  }

  async webSocketClose(ws: WebSocket): Promise<void> {
    // Hibernation API handles cleanup automatically
  }

  async webSocketError(ws: WebSocket): Promise<void> {
    try { ws.close(); } catch {}
  }
}
