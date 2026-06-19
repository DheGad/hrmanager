const { generateSecret, generateURI, generateSync, verifySync } = require('otplib');

const secret = generateSecret();
const uri = generateURI({ label: 'test@test.com', issuer: 'test', secret });
console.log("URI:", uri);

const token = generateSync({ secret });
console.log("Token:", token);

const isValid = verifySync({ token, secret });
console.log("IsValid:", isValid);
