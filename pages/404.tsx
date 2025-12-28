export default function Custom404() {
    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#0a1628',
            color: 'white',
            fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
            <h1 style={{ fontSize: '6rem', margin: 0, color: '#3b82f6' }}>404</h1>
            <h2 style={{ fontSize: '1.5rem', marginTop: '1rem', color: '#94a3b8' }}>Page Not Found</h2>
            <p style={{ color: '#64748b', marginTop: '0.5rem' }}>The page you're looking for doesn't exist.</p>
            <a
                href="/login"
                style={{
                    marginTop: '2rem',
                    padding: '0.75rem 2rem',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    borderRadius: '0.5rem',
                    textDecoration: 'none',
                    fontWeight: '500'
                }}
            >
                Go to Login
            </a>
        </div>
    )
}
