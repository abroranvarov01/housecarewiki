import { ImageResponse } from 'next/og';

export const runtime = 'edge';

// The logo mark from components/BrandMark (light tone), inlined for the OG renderer.
const LOGO_MARK = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path d="M5 44 31 21l27 23" fill="none" stroke="#C75E3D" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/><path d="M43 17h7v18l-7-6z" fill="#C75E3D"/><g fill="#F6C343"><rect x="23.5" y="31" width="6.5" height="6.5" rx="1.2"/><rect x="32" y="31" width="6.5" height="6.5" rx="1.2"/><rect x="23.5" y="39.5" width="6.5" height="6.5" rx="1.2"/><rect x="32" y="39.5" width="6.5" height="6.5" rx="1.2"/></g><g stroke="#F6C343" stroke-width="3.4" stroke-linecap="round"><path d="M45 11.5 43.5 5.5"/><path d="M50.5 12 54 6.5"/><path d="M54 17l6-2.5"/></g></svg>',
)}`;

// Auto-generated 1200×630 Open Graph image: /og?title=...&kicker=...
export function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = (searchParams.get('title') || 'Home cleaning guides & honest product research').slice(0, 120);
  const kicker = (searchParams.get('kicker') || 'The practical home care guide').slice(0, 60);

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
          background: '#F8F4EB',
          color: '#29322C',
          borderTop: '14px solid #F6C343',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={LOGO_MARK} width={72} height={72} alt="" />
          <div style={{ display: 'flex', fontSize: 38, fontWeight: 700 }}>
            <span style={{ color: '#285E3E' }}>HouseCare</span>
            <span style={{ color: '#C75E3D' }}>Wiki</span>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ fontSize: 26, fontWeight: 700, color: '#9A4E30' }}>
            {kicker}
          </div>
          <div style={{ fontSize: title.length > 60 ? 56 : 68, fontWeight: 700, lineHeight: 1.1 }}>{title}</div>
        </div>
        <div style={{ fontSize: 24, color: '#5B635C' }}>housecarewiki.com</div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: { 'Cache-Control': 'public, max-age=86400, s-maxage=604800' },
    },
  );
}
