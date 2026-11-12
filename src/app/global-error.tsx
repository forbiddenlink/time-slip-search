'use client'

export default function GlobalError({ error: _error, reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: '#17140F', color: '#17140F' }}>
        <main
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <div
            style={{
              background: '#EFE6D2',
              maxWidth: '36rem',
              width: '100%',
              padding: '2.5rem 1.5rem',
              textAlign: 'center',
              fontFamily: 'Georgia, serif',
            }}
          >
            <p style={{ margin: 0, fontFamily: 'Arial, sans-serif', fontSize: '0.75rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#B3261E', fontWeight: 600 }}>
              Correction
            </p>
            <h1 style={{ fontStyle: 'italic', fontWeight: 400, fontSize: '2.25rem', margin: '0.75rem 0' }}>
              Something went wrong
            </h1>
            <button
              type="button"
              onClick={reset}
              style={{
                minHeight: '2.75rem',
                padding: '0.5rem 1rem',
                border: '1px solid #17140F',
                background: 'transparent',
                color: '#17140F',
                fontFamily: 'Arial, sans-serif',
                fontSize: '0.75rem',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Try again
            </button>
          </div>
        </main>
      </body>
    </html>
  )
}
