const otplib = require('otplib');

const secret = otplib.generateSecret();
const uri = otplib.generateURI({ accountName: 'test', issuer: 'test', secret: secret.secret || secret });
console.log("URI:", uri);

const token = otplib.generate(secret.secret || secret);
console.log("Token:", token);

const isValid = otplib.verify({ token, secret: secret.secret || secret });
console.log("IsValid:", isValid);
