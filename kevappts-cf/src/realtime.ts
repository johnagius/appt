/**
 * Durable Object: RealtimeHub
 *
 * WebSocket-based real-time hub. Replaces ALL polling with push.
 *
 * How it works:
 * 1. Client connects via WebSocket to /api/ws
 * 2. Client sends: { subscribe: "slots", dateKey: "2026-04-02" }
 *    to only receive updates for dates they care about
 * 3. When a booking/cancel/change happens, the API calls /broadcast
 *    with the full updated data payload
 * 4. Server pushes the data directly to subscribed clients —
 *    NO extra API call needed by the client
 *
 * This means:
 * - Booking page: 1 API call on load (/api/init), then ZERO calls
 *   until the user books. All slot updates arrive via WebSocket.
 * - Admin page: 1 API call on load, then ZERO polling. All changes
 *   pushed instantly.
 * - Cancel/redirect: patient sees "slot taken" instantly without refresh
 */
export class RealtimeHub {
  private state: DurableObjectState;
  private sessions: Map<WebSocket, ClientSession> = new Map();

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

      this.state.acceptWebSocket(server);

      this.sessions.set(server, {
        subscribedDates: new Set(),
        subscribedChannels: new Set(['global']),
        connectedAt: Date.now(),
      });

      // Send welcome message
      server.send(JSON.stringify({ type: 'connected', clients: this.sessions.size }));

      return new Response(null, { status: 101, webSocket: client });
    }

    // ─── Broadcast (called by API handlers after mutations) ─
    if (url.pathname === '/broadcast' && request.method === 'POST') {
      const message = await request.json() as BroadcastMessage;

      const payload = JSON.stringify(message);
      let sent = 0;

      for (const [ws, session] of this.sessions) {
        try {
          // Route message to relevant subscribers
          const shouldSend =
            session.subscribedChannels.has('admin') ||  // Admins get everything
            session.subscribedChannels.has('global') ||
            (message.dateKey && session.subscribedDates.has(message.dateKey));

          if (shouldSend) {
            ws.send(payload);
            sent++;
          }
        } catch {
          // Dead connection — will be cleaned up in webSocketClose
          this.sessions.delete(ws);
          try { ws.close(); } catch {}
        }
      }

      return Response.json({ ok: true, sent, total: this.sessions.size });
    }

    // ─── Broadcast with full data (push data, not just notification) ─
    if (url.pathname === '/push-data' && request.method === 'POST') {
      const message = await request.json() as PushDataMessage;

      const payload = JSON.stringify(message);
      let sent = 0;

      for (const [ws, session] of this.sessions) {
        try {
          const shouldSend =
            session.subscribedChannels.has('admin') ||
            (message.dateKey && session.subscribedDates.has(message.dateKey));

          if (shouldSend) {
            ws.send(payload);
            sent++;
          }
        } catch {
          this.sessions.delete(ws);
          try { ws.close(); } catch {}
        }
      }

      return Response.json({ ok: true, sent, total: this.sessions.size });
    }

    // ─── Status ─────────────────────────────────────
    if (url.pathname === '/status') {
      const channels: Record<string, number> = {};
      const dates: Record<string, number> = {};

      for (const [, session] of this.sessions) {
        for (const ch of session.subscribedChannels) {
          channels[ch] = (channels[ch] || 0) + 1;
        }
        for (const dk of session.subscribedDates) {
          dates[dk] = (dates[dk] || 0) + 1;
        }
      }

      return Response.json({
        connections: this.sessions.size,
        channels,
        dates,
      });
    }

    return new Response('Not Found', { status: 404 });
  }

  // Called by the runtime when a WebSocket message arrives
  async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer): Promise<void> {
    const session = this.sessions.get(ws);
    if (!session) return;

    try {
      const data = JSON.parse(typeof message === 'string' ? message : new TextDecoder().decode(message));

      // Client subscribes to a specific date's slot updates
      // { subscribe: "date", dateKey: "2026-04-02" }
      if (data.subscribe === 'date' && data.dateKey) {
        session.subscribedDates.add(data.dateKey);
        ws.send(JSON.stringify({ type: 'subscribed', channel: 'date', dateKey: data.dateKey }));
      }

      // Client unsubscribes from a date (switched to different date in picker)
      // { unsubscribe: "date", dateKey: "2026-04-02" }
      if (data.unsubscribe === 'date' && data.dateKey) {
        session.subscribedDates.delete(data.dateKey);
      }

      // Subscribe to admin channel (gets all updates)
      // { subscribe: "admin" }
      if (data.subscribe === 'admin') {
        session.subscribedChannels.add('admin');
        ws.send(JSON.stringify({ type: 'subscribed', channel: 'admin' }));
      }

      // Ping/pong keepalive
      if (data.type === 'ping') {
        ws.send(JSON.stringify({ type: 'pong' }));
      }
    } catch {
      // Invalid message — ignore
    }
  }

  // Called when a WebSocket is closed
  async webSocketClose(ws: WebSocket, code: number, reason: string, wasClean: boolean): Promise<void> {
    this.sessions.delete(ws);
  }

  // Called when a WebSocket encounters an error
  async webSocketError(ws: WebSocket, error: unknown): Promise<void> {
    this.sessions.delete(ws);
    try { ws.close(); } catch {}
  }
}

interface ClientSession {
  subscribedDates: Set<string>;
  subscribedChannels: Set<string>;
  connectedAt: number;
}

interface BroadcastMessage {
  type: 'slots_updated' | 'dates_updated' | 'config_updated' | 'appointment_changed';
  dateKey?: string;
  [key: string]: any;
}

interface PushDataMessage {
  type: 'slots_data' | 'dates_data' | 'dashboard_data';
  dateKey?: string;
  data: any;
}
