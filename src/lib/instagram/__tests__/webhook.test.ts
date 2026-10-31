import { describe, expect, it } from 'vitest';
import { parseWebhook, signPayload, verifySignature } from '../webhook';

describe('verifySignature', () => {
  const body = '{"object":"instagram"}';
  it('accepts a valid sha256 signature under any configured secret', () => {
    expect(verifySignature(body, signPayload(body, 's2'), ['s1', 's2'])).toBe(true);
  });
  it('rejects wrong, missing or malformed signatures', () => {
    expect(verifySignature(body, signPayload(body, 'other'), ['s1'])).toBe(false);
    expect(verifySignature(body, null, ['s1'])).toBe(false);
    expect(verifySignature(body, 'sha1=abc', ['s1'])).toBe(false);
    expect(verifySignature(body, signPayload(body, 's1'), [])).toBe(false);
    expect(verifySignature(body + ' ', signPayload(body, 's1'), ['s1'])).toBe(false);
  });
});

describe('parseWebhook', () => {
  it('reads comment changes', () => {
    const { comments } = parseWebhook({
      object: 'instagram',
      entry: [
        {
          id: '1784',
          time: 1793534400,
          changes: [
            { field: 'comments', value: { id: 'c9', from: { id: 'u5', username: 'ann' }, text: 'CAT', media: { id: 'm3', media_product_type: 'REELS' } } },
            { field: 'mentions', value: { id: 'x' } },
          ],
        },
      ],
    });
    expect(comments).toEqual([
      { accountId: '1784', commentId: 'c9', mediaId: 'm3', fromId: 'u5', fromUsername: 'ann', text: 'CAT', parentId: null, createdAt: new Date(1793534400 * 1000) },
    ]);
  });
  it('reads messages, quick reply payloads and echoes', () => {
    const { messages } = parseWebhook({
      object: 'instagram',
      entry: [
        {
          id: '1784',
          messaging: [
            { sender: { id: 'u5' }, recipient: { id: '1784' }, message: { mid: 'm1', text: 'send the links', quick_reply: { payload: 'HCW_LINKS:cat' } } },
            { sender: { id: '1784' }, recipient: { id: 'u5' }, message: { mid: 'm2', text: 'hi', is_echo: true } },
            { sender: { id: 'u5' }, postback: { mid: 'm3', title: 'Go', payload: 'P' } },
          ],
        },
      ],
    });
    expect(messages.map((m) => [m.mid, m.payload, m.isEcho])).toEqual([
      ['m1', 'HCW_LINKS:cat', false],
      ['m2', null, true],
      ['m3', 'P', false],
    ]);
  });
  it('ignores other objects and junk', () => {
    expect(parseWebhook({ object: 'page', entry: [] })).toEqual({ comments: [], messages: [] });
    expect(parseWebhook(null)).toEqual({ comments: [], messages: [] });
  });
});
