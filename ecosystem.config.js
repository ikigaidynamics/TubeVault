module.exports = {
  apps: [{
    name: 'tubevault',
    script: 'node_modules/.bin/next',
    args: 'start -p 3001',
    cwd: '/opt/tubevault',
    node_args: '--max-http-header-size=65536',
    env: {
      NODE_ENV: 'production',
    },
  }],
};