import type { IgConfig } from './config';

// Thin client for graph.instagram.com. Calls that publish or message someone go through `write`, which in
// dry-run mode returns a fake result and never touches the network.

export class GraphError extends Error {
  constructor(message: string, readonly status: number, readonly code?: number, readonly subcode?: number) {
    super(message);
  }
}

type Params = Record<string, string | number | boolean | undefined>;

export interface DryRunCall {
  method: string;
  path: string;
  body: unknown;
}

export class GraphClient {
  readonly dryRunCalls: DryRunCall[] = [];

  constructor(private cfg: IgConfig, private token: string) {}

  private url(path: string, params: Params = {}) {
    const u = new URL(`${this.cfg.graphHost}/${this.cfg.apiVersion}/${path.replace(/^\//, '')}`);
    for (const [k, v] of Object.entries(params)) if (v !== undefined) u.searchParams.set(k, String(v));
    return u;
  }

  private async request<T>(method: 'GET' | 'POST', path: string, params: Params = {}, json?: unknown): Promise<T> {
    if (!this.token) throw new GraphError('No Instagram access token configured', 0);
    const res = await fetch(this.url(path, method === 'GET' || json !== undefined ? params : {}), {
      method,
      headers: {
        Authorization: `Bearer ${this.token}`,
        ...(json !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(method === 'POST' && json === undefined ? { 'Content-Type': 'application/x-www-form-urlencoded' } : {}),
      },
      body:
        json !== undefined
          ? JSON.stringify(json)
          : method === 'POST'
            ? new URLSearchParams(Object.entries(params).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)]))
            : undefined,
      cache: 'no-store',
    });
    const data = (await res.json().catch(() => ({}))) as { error?: { message?: string; code?: number; error_subcode?: number } };
    if (!res.ok || data.error) {
      const e = data.error || {};
      throw new GraphError(e.message || `HTTP ${res.status}`, res.status, e.code, e.error_subcode);
    }
    return data as T;
  }

  get<T>(path: string, params?: Params) {
    return this.request<T>('GET', path, params);
  }

  private async write<T>(path: string, fake: T, params?: Params, json?: unknown): Promise<T> {
    if (this.cfg.dryRun) {
      this.dryRunCalls.push({ method: 'POST', path, body: json ?? params });
      return fake;
    }
    return this.request<T>('POST', path, params, json);
  }

  me() {
    return this.get<{ user_id?: string; id: string; username: string }>('me', { fields: 'user_id,username' });
  }

  replyToComment(commentId: string, message: string) {
    return this.write<{ id: string }>(`${commentId}/replies`, { id: `dry-run-reply-${commentId}` }, { message });
  }

  // Private reply to a comment (recipient.comment_id) or a follow-up in an open conversation (recipient.id).
  sendMessage(igUserId: string, recipient: { comment_id: string } | { id: string }, text: string, quickReply?: { title: string; payload: string }) {
    const message: Record<string, unknown> = { text };
    if (quickReply) message.quick_replies = [{ content_type: 'text', title: quickReply.title, payload: quickReply.payload }];
    return this.write<{ recipient_id: string; message_id: string }>(
      `${igUserId}/messages`,
      { recipient_id: 'id' in recipient ? recipient.id : `dry-run-${recipient.comment_id}`, message_id: `dry-run-mid-${Date.now()}` },
      undefined,
      { recipient, message }
    );
  }

  createReelContainer(igUserId: string, p: { videoUrl: string; caption: string; coverUrl?: string; shareToFeed: boolean }) {
    return this.write<{ id: string }>(`${igUserId}/media`, { id: `dry-run-container-${Date.now()}` }, {
      media_type: 'REELS',
      video_url: p.videoUrl,
      caption: p.caption,
      cover_url: p.coverUrl,
      share_to_feed: p.shareToFeed,
    });
  }

  containerStatus(containerId: string) {
    return this.get<{ status_code: 'EXPIRED' | 'ERROR' | 'FINISHED' | 'IN_PROGRESS' | 'PUBLISHED'; status?: string }>(containerId, {
      fields: 'status_code,status',
    });
  }

  publish(igUserId: string, creationId: string) {
    return this.write<{ id: string }>(`${igUserId}/media_publish`, { id: `dry-run-media-${Date.now()}` }, { creation_id: creationId });
  }

  publishingLimit(igUserId: string) {
    return this.get<{ data: { quota_usage: number; config?: { quota_total: number; quota_duration: number } }[] }>(
      `${igUserId}/content_publishing_limit`,
      { fields: 'quota_usage,config' }
    );
  }

  mediaComments(mediaId: string) {
    return this.get<{ data: { id: string; text?: string; timestamp?: string; username?: string; from?: { id: string; username: string } }[] }>(
      `${mediaId}/comments`,
      { fields: 'id,text,timestamp,username,from', limit: 50 }
    );
  }

  // Account setting, run only from the explicit CLI command, so it is not held back by dry-run.
  subscribeApp(igUserId: string, fields: string) {
    return this.request<{ success: boolean }>('POST', `${igUserId}/subscribed_apps`, { subscribed_fields: fields });
  }
}

// Token refresh is not a write to any user, so it runs in dry-run mode too.
export async function refreshLongLivedToken(token: string): Promise<{ access_token: string; expires_in: number }> {
  const u = new URL('https://graph.instagram.com/refresh_access_token');
  u.searchParams.set('grant_type', 'ig_refresh_token');
  u.searchParams.set('access_token', token);
  const res = await fetch(u, { cache: 'no-store' });
  const data = (await res.json().catch(() => ({}))) as { access_token?: string; expires_in?: number; error?: { message?: string } };
  if (!res.ok || !data.access_token) throw new GraphError(data.error?.message || `HTTP ${res.status}`, res.status);
  return { access_token: data.access_token, expires_in: Number(data.expires_in || 0) };
}
