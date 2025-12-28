const path = require('path')

module.exports = {
    apps: [
        {
            name: 'bot-management-dashboard',
            script: path.join(__dirname, 'node_modules/next/dist/bin/next'),
            args: 'start',
            cwd: __dirname,
            interpreter: 'node',
            env: {
                NODE_ENV: 'production',
                PORT: 3000,
            },
            instances: 1,
            autorestart: true,
            watch: false,
        },
    ],
}
