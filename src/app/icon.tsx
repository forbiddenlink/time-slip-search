import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const size = {
  width: 32,
  height: 32,
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
          borderRadius: '6px',
        }}
      >
        {/* CRT frame */}
        <div
          style={{
            background: '#1a1815',
            border: '1.5px solid #2d2a26',
            borderRadius: '4px',
            width: '28px',
            height: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          {/* Clock face - time machine symbol */}
          <div
            style={{
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              border: '1.5px solid #40e0d0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              boxShadow: '0 0 6px #40e0d0, 0 0 12px rgba(64, 224, 208, 0.3)',
            }}
          >
            {/* Clock hands - pointing to ~10:10 for aesthetic */}
            <div
              style={{
                position: 'absolute',
                width: '1.5px',
                height: '6px',
                background: '#40e0d0',
                bottom: '50%',
                left: '50%',
                transformOrigin: 'bottom center',
                transform: 'translateX(-50%) rotate(-60deg)',
                borderRadius: '1px',
              }}
            />
            <div
              style={{
                position: 'absolute',
                width: '1.5px',
                height: '4px',
                background: '#ffbf00',
                bottom: '50%',
                left: '50%',
                transformOrigin: 'bottom center',
                transform: 'translateX(-50%) rotate(60deg)',
                borderRadius: '1px',
              }}
            />
            {/* Center dot */}
            <div
              style={{
                width: '2px',
                height: '2px',
                borderRadius: '50%',
                background: '#ff3131',
                position: 'absolute',
              }}
            />
          </div>

          {/* Rewind arrows at bottom */}
          <div
            style={{
              position: 'absolute',
              bottom: '1px',
              display: 'flex',
              fontSize: '5px',
              color: '#ffbf00',
              fontFamily: 'monospace',
              letterSpacing: '-1px',
            }}
          >
            {'◄◄'}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
