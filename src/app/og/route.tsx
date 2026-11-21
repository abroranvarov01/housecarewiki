import { ImageResponse } from 'next/og';

export const runtime = 'edge';

// The logo mark from components/BrandMark (light tone), inlined for the OG renderer.
const LOGO_MARK = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="27" cy="38" r="23" fill="#1F5C5B"/><path d="M12.5 36.5A15 15 0 0 1 25 22.2" fill="none" stroke="#FBF4EC" stroke-width="5" stroke-linecap="round"/><circle cx="14.2" cy="43.5" r="2.6" fill="#FBF4EC"/><circle cx="50" cy="12" r="7.5" fill="#F6B996"/><circle cx="59" cy="25" r="4" fill="#F6B996"/></svg>',
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
          background: '#FBF4EC',
          color: '#1E2B2B',
          borderTop: '14px solid #F6B996',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={LOGO_MARK} width={72} height={72} alt="" />
          <div style={{ display: 'flex', fontSize: 38, fontWeight: 700 }}>
            <span style={{ color: '#1F5C5B' }}>HouseCare</span>
            <span style={{ color: '#A9432C' }}>Wiki</span>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ fontSize: 26, fontWeight: 700, color: '#A9432C' }}>
            {kicker}
          </div>
          <div style={{ fontSize: title.length > 60 ? 56 : 68, fontWeight: 700, lineHeight: 1.1 }}>{title}</div>
        </div>
        <div style={{ fontSize: 24, color: '#56605F' }}>housecarewiki.com</div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: { 'Cache-Control': 'public, max-age=86400, s-maxage=604800' },
    },
  );
}
