const fs = require('fs');
let env = fs.readFileSync('apps/api/.env', 'utf8');
const priv = fs.readFileSync('jwtRS256.key', 'utf8');
const pub = fs.readFileSync('jwtRS256.key.pub', 'utf8');

// remove old JWT keys
env = env.split('\n').filter(line => !line.startsWith('JWT_PRIVATE_KEY') && !line.startsWith('JWT_PUBLIC_KEY')).join('\n');
// add clean keys
env += `\nJWT_PRIVATE_KEY=${Buffer.from(priv).toString('base64')}\n`;
env += `JWT_PUBLIC_KEY=${Buffer.from(pub).toString('base64')}\n`;
fs.writeFileSync('apps/api/.env', env);
