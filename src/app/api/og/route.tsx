import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const date = searchParams.get('date') || 'Unknown Date'
    const song = searchParams.get('song')
    const position = searchParams.get('position')
    const movie = searchParams.get('movie')
    const gas = searchParams.get('gas')

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
            fontFamily: 'monospace',
          }}
        >
          {/* Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '40px',
          }}>
            <div style={{
              fontSize: '72px',
              color: '#e0d5c7',
              marginRight: '20px',
            }}>
              TimeSlip
            </div>
            <div style={{
              fontSize: '72px',
              color: '#00d4aa',
              textShadow: '0 0 20px #00d4aa',
            }}>
              Search
            </div>
          </div>

          {/* Date Display */}
          <div style={{
            fontSize: '48px',
            color: '#ffc933',
            marginBottom: '60px',
            textAlign: 'center',
            fontWeight: 'bold',
          }}>
            {date}
          </div>

          {/* Content Grid */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            width: '80%',
          }}>
            {song && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                background: '#2a2a2a',
                padding: '20px',
                borderRadius: '10px',
                border: '2px solid #ffc933',
              }}>
                <div style={{
                  fontSize: '36px',
                  marginRight: '20px',
                  color: '#ffc933',
                }}>
                  #{position}
                </div>
                <div style={{
                  fontSize: '28px',
                  color: '#e0d5c7',
                }}>
                  🎵 {song}
                </div>
              </div>
            )}

            {movie && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                background: '#2a2a2a',
                padding: '20px',
                borderRadius: '10px',
                border: '2px solid #00d4aa',
              }}>
                <div style={{
                  fontSize: '28px',
                  color: '#e0d5c7',
                }}>
                  🎬 {movie}
                </div>
              </div>
            )}

            {gas && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                background: '#2a2a2a',
                padding: '20px',
                borderRadius: '10px',
                border: '2px solid #7fff00',
              }}>
                <div style={{
                  fontSize: '28px',
                  color: '#e0d5c7',
                }}>
                  ⛽ Gas: ${gas}/gallon
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div style={{
            position: 'absolute',
            bottom: '40px',
            fontSize: '20px',
            color: '#e0d5c788',
          }}>
            Explore any moment in history
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    )
  } catch (error) {
    console.error('OG Image generation error:', error)
    return new Response('Failed to generate image', { status: 500 })
  }
}
