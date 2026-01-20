export default function NotFound() {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh', 
      padding: '1rem', 
      textAlign: 'center',
      background: 'linear-gradient(to bottom right, #0f172a, #1e1b4b, #0f172a)'
    }}>
      <h1 style={{ 
        fontSize: '6rem', 
        fontWeight: 'bold', 
        marginBottom: '1rem', 
        background: 'linear-gradient(to right, #ef4444, #dc2626)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text'
      }}>
        404
      </h1>
      <p style={{ 
        fontSize: '1.5rem', 
        marginBottom: '2rem',
        color: '#94a3b8'
      }}>
        Page not found
      </p>
      <a 
        href="/" 
        style={{ 
          padding: '0.75rem 1.5rem', 
          background: 'linear-gradient(to right, #8b5cf6, #7c3aed)',
          borderRadius: '0.5rem', 
          color: '#ffffff', 
          textDecoration: 'none',
          fontWeight: '600',
          transition: 'transform 0.2s'
        }}
      >
        Back to Home
      </a>
    </div>
  )
}
