import { ImageResponse } from 'next/og';

export const runtime = 'edge';

// Auto-generated 1200×630 Open Graph image: /og?title=...&kicker=...
export function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = (searchParams.get('title') || 'Real solutions for everyday messy moments').slice(0, 120);
  const kicker = (searchParams.get('kicker') || 'Home care guides & honest reviews').slice(0, 60);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px 72px',
          background: '#F7F4EE',
          color: '#1F2924',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background: '#1E3A2F',
              color: '#F7F4EE',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 36,
              fontWeight: 700,
            }}
          >
            H
          </div>
          <div style={{ fontSize: 34, fontWeight: 700, color: '#1E3A2F' }}>HouseCareWiki</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ fontSize: 26, fontWeight: 700, color: '#E26D42', textTransform: 'uppercase', letterSpacing: 2 }}>
            {kicker}
          </div>
          <div style={{ fontSize: title.length > 60 ? 56 : 68, fontWeight: 700, lineHeight: 1.1 }}>{title}</div>
        </div>
        <div style={{ fontSize: 24, color: '#4A5550' }}>housecarewiki.com</div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: { 'Cache-Control': 'public, max-age=86400, s-maxage=604800' },
    },
  );
}
