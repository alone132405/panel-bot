const path = require('path')
const appName = process.env.PM2_APP_NAME || 'bot-dash'
const port = Number.parseInt(process.env.PORT || '3000', 10)

module.exports = {
    apps: [
        {
            name: appName,
            script: path.join(__dirname, 'server.js'),
            args: '',
            cwd: __dirname,
            interpreter: 'node',
            env: {
                NODE_ENV: process.env.NODE_ENV || 'production',
                PORT: Number.isFinite(port) && port > 0 ? port : 3000,
            },
            instances: 1,
            autorestart: true,
            watch: false,
            max_restarts: 5,
            restart_delay: 5000,
        },
    ],
}
