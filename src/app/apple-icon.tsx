import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const size = {
  width: 180,
  height: 180,
}

export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#0a0908',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '22px',
        }}
      >
        {/* CRT screen frame */}
        <div
          style={{
            background: '#1a1815',
            border: '4px solid #2d2a26',
            borderRadius: '16px',
            width: '160px',
            height: '160px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          {/* REC indicator */}
          <div
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: '#ff3131',
            }}
          />

          {/* TS text */}
          <span
            style={{
              fontFamily: 'monospace',
              fontSize: '64px',
              fontWeight: 'bold',
              color: '#40e0d0',
              textShadow: '0 0 10px #40e0d0',
            }}
          >
            TS
          </span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
