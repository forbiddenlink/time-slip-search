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
              top: '10px',
              right: '10px',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#ff3131',
              boxShadow: '0 0 4px #ff3131',
            }}
          />

          {/* Clock face */}
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              border: '3px solid #40e0d0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              boxShadow: '0 0 20px rgba(64, 224, 208, 0.4), 0 0 40px rgba(64, 224, 208, 0.2), inset 0 0 10px rgba(64, 224, 208, 0.1)',
            }}
          >
            {/* Hour markers */}
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
              <div
                key={deg}
                style={{
                  position: 'absolute',
                  width: deg % 90 === 0 ? '3px' : '2px',
                  height: deg % 90 === 0 ? '6px' : '4px',
                  background: deg % 90 === 0 ? '#40e0d0' : 'rgba(64, 224, 208, 0.5)',
                  top: '3px',
                  left: '50%',
                  transformOrigin: `50% ${72 / 2 - 6}px`,
                  transform: `translateX(-50%) rotate(${deg}deg)`,
                  borderRadius: '1px',
                }}
              />
            ))}

            {/* Hour hand */}
            <div
              style={{
                position: 'absolute',
                width: '3px',
                height: '20px',
                background: '#40e0d0',
                bottom: '50%',
                left: '50%',
                transformOrigin: 'bottom center',
                transform: 'translateX(-50%) rotate(-60deg)',
                borderRadius: '2px',
                boxShadow: '0 0 4px #40e0d0',
              }}
            />
            {/* Minute hand */}
            <div
              style={{
                position: 'absolute',
                width: '2.5px',
                height: '26px',
                background: '#ffbf00',
                bottom: '50%',
                left: '50%',
                transformOrigin: 'bottom center',
                transform: 'translateX(-50%) rotate(60deg)',
                borderRadius: '2px',
                boxShadow: '0 0 4px #ffbf00',
              }}
            />
            {/* Center dot */}
            <div
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: '#ff3131',
                position: 'absolute',
                boxShadow: '0 0 4px #ff3131',
              }}
            />
          </div>

          {/* Rewind symbol */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '2px',
              marginTop: '8px',
            }}
          >
            <span
              style={{
                fontFamily: 'monospace',
                fontSize: '16px',
                color: '#ffbf00',
                textShadow: '0 0 6px rgba(255, 191, 0, 0.5)',
                letterSpacing: '-2px',
              }}
            >
              {'◄◄'}
            </span>
            <span
              style={{
                fontFamily: 'monospace',
                fontSize: '10px',
                color: 'rgba(232, 224, 213, 0.5)',
                letterSpacing: '2px',
                marginLeft: '6px',
              }}
            >
              REWIND
            </span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
