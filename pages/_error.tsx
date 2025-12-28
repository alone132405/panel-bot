function Error({ statusCode }: { statusCode?: number }) {
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
            <h1 style={{ fontSize: '6rem', margin: 0, color: '#ef4444' }}>
                {statusCode || 'Error'}
            </h1>
            <h2 style={{ fontSize: '1.5rem', marginTop: '1rem', color: '#94a3b8' }}>
                {statusCode === 404 ? 'Page Not Found' : 'An Error Occurred'}
            </h2>
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

Error.getInitialProps = ({ res, err }: { res?: { statusCode: number }, err?: { statusCode: number } }) => {
    const statusCode = res ? res.statusCode : err ? err.statusCode : 404
    return { statusCode }
}

export default Error
