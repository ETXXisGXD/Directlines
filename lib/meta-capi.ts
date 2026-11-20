import 'server-only';
import { createHash } from 'node:crypto';
import { createAdminClient } from '@/lib/supabase/admin';

function sha256(value: string | null | undefined): string | null {
  if (!value) return null;
  const normalized = value.trim().toLowerCase();
  if (!normalized) return null;
  return createHash('sha256').update(normalized).digest('hex');
}

function normalizePhone(value: string | null | undefined): string | null {
  if (!value) return null;
  let clean = value.replace(/[^0-9]/g, '');
  if (clean.startsWith('0')) clean = `234${clean.slice(1)}`;
  return clean || null;
}

function splitName(name: string | null | undefined): { first: string | null; last: string | null } {
  if (!name) return { first: null, last: null };
  const parts = name.trim().split(/\s+/);
  return { first: parts[0] ?? null, last: parts.slice(1).join(' ') || null };
}

export interface CapiUserData {
  email?: string | null;
  phone?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  fullName?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  externalId?: string | null;
  fbp?: string | null;
  fbc?: string | null;
  clientIp?: string | null;
  clientUserAgent?: string | null;
}

export interface CapiEventInput {
  pixelId: string;
  accessToken: string;
  testEventCode?: string | null;
  eventName: string;
  eventId: string;
  eventTime?: number;
  sourceUrl: string;
  userData: CapiUserData;
  customData?: Record<string, unknown>;
  orderId?: string | null;
  value?: number | null;
  graphVersion?: string;
}

function buildUserData(input: CapiUserData) {
  const names = input.firstName || input.lastName ? { first: input.firstName, last: input.lastName } : splitName(input.fullName);
  const data: Record<string, string | string[]> = {};
  const email = sha256(input.email);
  const phone = sha256(normalizePhone(input.phone));
  const first = sha256(names.first);
  const last = sha256(names.last);
  const city = sha256(input.city);
  const state = sha256(input.state);
  const country = sha256(input.country ?? 'NG');
  const external = sha256(input.externalId);

  if (email) data.em = [email];
  if (phone) data.ph = [phone];
  if (first) data.fn = [first];
  if (last) data.ln = [last];
  if (city) data.ct = [city];
  if (state) data.st = [state];
  if (country) data.country = [country];
  if (external) data.external_id = [external];
  if (input.fbp) data.fbp = input.fbp;
  if (input.fbc) data.fbc = input.fbc;
  if (input.clientIp) data.client_ip_address = input.clientIp;
  if (input.clientUserAgent) data.client_user_agent = input.clientUserAgent;
  return data;
}

export async function sendCapiEvent(input: CapiEventInput): Promise<{ ok: boolean; status: number; body: unknown }> {
  const version = input.graphVersion ?? process.env.META_GRAPH_VERSION ?? 'v23.0';
  const payload: Record<string, unknown> = {
    data: [
      {
        event_name: input.eventName,
        event_time: input.eventTime ?? Math.floor(Date.now() / 1000),
        event_id: input.eventId,
        event_source_url: input.sourceUrl,
        action_source: 'website',
        user_data: buildUserData(input.userData),
        custom_data: input.customData ?? {},
      },
    ],
  };
  if (input.testEventCode) payload.test_event_code = input.testEventCode;

  let status = 0;
  let body: unknown = null;
  let ok = false;
  try {
    const response = await fetch(
      `https://graph.facebook.com/${version}/${input.pixelId}/events?access_token=${encodeURIComponent(input.accessToken)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }
    );
    status = response.status;
    const text = await response.text();
    try {
      body = JSON.parse(text);
    } catch {
      body = { message: text.slice(0, 500) };
    }
    ok = response.ok;
  } catch (error) {
    body = { message: error instanceof Error ? error.message : 'network error' };
  }

  try {
    const admin = createAdminClient();
    await admin.from('meta_events').upsert(
      {
        event_name: input.eventName,
        event_id: input.eventId,
        status: ok ? 'sent' : 'failed',
        http_status: status,
        response: body,
        order_id: input.orderId ?? null,
        value: input.value ?? null,
      },
      { onConflict: 'event_id' }
    );
  } catch {
    // Logging must not block the event.
  }

  return { ok, status, body };
}
