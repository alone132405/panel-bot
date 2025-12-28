/** @type {import('next').NextConfig} */
const nextConfig = {
    // Use standalone output for production deployment
    output: 'standalone',

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
