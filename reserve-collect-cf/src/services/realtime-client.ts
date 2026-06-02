/** Fire-and-forget broadcast to all connected dashboards via the RealtimeHub DO. */
import type { Env } from '../types';

export async function broadcast(env: Env, message: Record<string, unknown>): Promise<void> {
  try {
    const id = env.REALTIME.idFromName('global');
    const stub = env.REALTIME.get(id);
    await stub.fetch('http://internal/broadcast', { method: 'POST', body: JSON.stringify(message) });
  } catch (e) { console.error('broadcast error:', e); }
}
