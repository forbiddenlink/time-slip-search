import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'TimeSlipSearch - Your Cultural Time Machine'
export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#0a0908',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        {/* CRT screen frame */}
        <div
          style={{
            background: 'linear-gradient(180deg, #1a1815 0%, #0a0908 100%)',
            border: '8px solid #2d2a26',
            borderRadius: '32px',
            width: '1100px',
            height: '530px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            boxShadow: 'inset 0 0 100px rgba(0,0,0,0.5)',
          }}
        >
          {/* REC indicator */}
          <div
            style={{
              position: 'absolute',
              top: '30px',
              left: '40px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <div
              style={{
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                background: '#ff3131',
              }}
            />
            <span
              style={{
                fontFamily: 'monospace',
                fontSize: '24px',
                color: '#ff3131',
                letterSpacing: '4px',
              }}
            >
              REC
            </span>
          </div>

          {/* Timestamp */}
          <div
            style={{
              position: 'absolute',
              top: '30px',
              right: '40px',
              fontFamily: 'monospace',
              fontSize: '28px',
              color: '#ffbf00',
            }}
          >
            1958-2020
          </div>

          {/* Main title */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '20px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'baseline' }}>
              <span
                style={{
                  fontFamily: 'Georgia, serif',
                  fontSize: '120px',
                  color: '#e8e0d5',
                  fontWeight: 'bold',
                }}
              >
                Time
              </span>
              <span
                style={{
                  fontFamily: 'Georgia, serif',
                  fontSize: '120px',
                  color: '#40e0d0',
                  fontWeight: 'bold',
                  textShadow: '0 0 20px #40e0d0, 0 0 40px #40e0d0',
                }}
              >
                Slip
              </span>
            </div>

            <span
              style={{
                fontFamily: 'monospace',
                fontSize: '48px',
                color: '#ffbf00',
                letterSpacing: '16px',
                textTransform: 'uppercase',
              }}
            >
              SEARCH
            </span>

            <span
              style={{
                fontFamily: 'Georgia, serif',
                fontSize: '32px',
                color: 'rgba(232, 224, 213, 0.6)',
                fontStyle: 'italic',
                marginTop: '20px',
              }}
            >
              Your cultural time machine
            </span>
          </div>

          {/* Feature icons at bottom */}
          <div
            style={{
              position: 'absolute',
              bottom: '40px',
              display: 'flex',
              gap: '60px',
            }}
          >
            {[
              { icon: '♫', label: 'Music', color: '#c73e3a' },
              { icon: '▶', label: 'Movies', color: '#ffbf00' },
              { icon: '$', label: 'Prices', color: '#40e0d0' },
              { icon: '◆', label: 'Events', color: '#40e0d0' },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <span style={{ fontSize: '36px', color: item.color }}>
                  {item.icon}
                </span>
                <span
                  style={{
                    fontFamily: 'monospace',
                    fontSize: '18px',
                    color: 'rgba(232, 224, 213, 0.5)',
                    letterSpacing: '2px',
                  }}
                >
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
