import crypto from 'crypto';

// Webhook signature check and payload parsing for Instagram API with Instagram Login.
// Payload shapes: developers.facebook.com/documentation/instagram-platform/webhooks/examples

export function verifySignature(rawBody: string, header: string | null, secrets: string[]): boolean {
  if (!header || !header.startsWith('sha256=') || secrets.length === 0) return false;
  const given = Buffer.from(header.slice(7), 'hex');
  return secrets.some((secret) => {
    const expected = crypto.createHmac('sha256', secret).update(rawBody, 'utf8').digest();
    return expected.length === given.length && crypto.timingSafeEqual(expected, given);
  });
}

export function signPayload(rawBody: string, secret: string): string {
  return `sha256=${crypto.createHmac('sha256', secret).update(rawBody, 'utf8').digest('hex')}`;
}

export interface ParsedComment {
  accountId: string;
  commentId: string;
  mediaId: string;
  fromId: string;
  fromUsername: string;
  text: string;
  parentId: string | null;
  createdAt: Date;
}

export interface ParsedMessage {
  accountId: string;
  mid: string;
  senderId: string;
  text: string | null;
  // Quick reply or postback payload, when the user tapped a button.
  payload: string | null;
  isEcho: boolean;
}

type Json = Record<string, unknown>;
const obj = (v: unknown): Json => (v && typeof v === 'object' ? (v as Json) : {});
const str = (v: unknown): string => (typeof v === 'string' ? v : typeof v === 'number' ? String(v) : '');

export function parseWebhook(body: unknown): { comments: ParsedComment[]; messages: ParsedMessage[] } {
  const comments: ParsedComment[] = [];
  const messages: ParsedMessage[] = [];
  const root = obj(body);
  if (root.object !== 'instagram' || !Array.isArray(root.entry)) return { comments, messages };

  for (const rawEntry of root.entry) {
    const entry = obj(rawEntry);
    const accountId = str(entry.id);
    // entry.time is in seconds; the comment payload itself carries no timestamp.
    const time = typeof entry.time === 'number' ? new Date(entry.time > 1e12 ? entry.time : entry.time * 1000) : new Date();

    for (const rawChange of Array.isArray(entry.changes) ? entry.changes : []) {
      const change = obj(rawChange);
      if (change.field !== 'comments') continue;
      const value = obj(change.value);
      const from = obj(value.from);
      const media = obj(value.media);
      const commentId = str(value.id);
      if (!commentId || !str(media.id)) continue;
      comments.push({
        accountId,
        commentId,
        mediaId: str(media.id),
        fromId: str(from.id),
        fromUsername: str(from.username),
        text: str(value.text),
        parentId: str(value.parent_id) || null,
        createdAt: time,
      });
    }

    for (const rawEvent of Array.isArray(entry.messaging) ? entry.messaging : []) {
      const event = obj(rawEvent);
      const message = obj(event.message);
      const postback = obj(event.postback);
      const mid = str(message.mid) || str(postback.mid);
      if (!mid) continue;
      messages.push({
        accountId,
        mid,
        senderId: str(obj(event.sender).id),
        text: str(message.text) || str(postback.title) || null,
        payload: str(obj(message.quick_reply).payload) || str(postback.payload) || null,
        isEcho: message.is_echo === true,
      });
    }
  }
  return { comments, messages };
}
