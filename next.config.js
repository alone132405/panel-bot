/** @type {import('next').NextConfig} */
const nextConfig = {
    // output: 'standalone', // Removed to allow custom server.js wrapper to run

    async rewrites() {
        return [
            {
                source: '/api/socket/io/:path*',
                destination: '/api/socket/io/:path*', // Ensure Next.js ignores this route
            },
        ];
    },

    webpack: (config, { isServer }) => {
        if (!isServer) {
            config.resolve.fallback = {
                ...config.resolve.fallback,
                fs: false,
                net: false,
                tls: false,
            };
        }

        // Ignore fsevents (macOS only) on Windows
        config.resolve.alias = {
            ...config.resolve.alias,
            'fsevents': false
        };

        return config;
    },
}

module.exports = nextConfig
