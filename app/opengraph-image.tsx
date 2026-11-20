import { ImageResponse } from 'next/og';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#142b58',
          color: 'white',
          padding: '64px',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            right: -120,
            top: -160,
            width: 520,
            height: 520,
            borderRadius: 520,
            border: '68px solid rgba(220,38,38,0.28)',
          }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 54, height: 54, borderRadius: 16, background: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, fontWeight: 800 }}>D</div>
          <div style={{ fontSize: 26, letterSpacing: 2, textTransform: 'uppercase', color: '#ffb3bd' }}>Directlines</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', fontSize: 72, lineHeight: 1.02, fontWeight: 700, maxWidth: 900 }}>
            Phones that fit your life.
          </div>
          <div style={{ display: 'flex', marginTop: 24, fontSize: 28, color: 'rgba(255,255,255,0.64)' }}>
            Karu, Abuja. Open 24/7. EasyBuy available.
          </div>
        </div>
        <div style={{ display: 'flex', gap: 32, fontSize: 22, color: 'rgba(255,255,255,0.55)' }}>
          <span>Infinix</span><span>TECNO</span><span>Samsung</span><span>itel</span><span>Redmi</span>
        </div>
      </div>
    ),
    size
  );
}

