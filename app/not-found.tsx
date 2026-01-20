export default function NotFound() {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', fontFamily: 'system-ui' }}>
        <div style={{ textAlign: 'center', color: 'white' }}>
          <h1 style={{ fontSize: '4rem', marginBottom: '1rem' }}>404</h1>
          <p>Page not found</p>
          <a href="/" style={{ color: '#a855f7', marginTop: '1rem', display: 'inline-block' }}>Go home</a>
        </div>
      </body>
    </html>
  )
}
