require('dotenv').config({ path: 'apps/api/.env' });
const val = process.env.JWT_PRIVATE_KEY;
console.log("Val length:", val ? val.length : 0);
if (val) {
  const decoded = Buffer.from(val, 'base64').toString('utf-8');
  console.log("Decoded begins with:", decoded.substring(0, 30));
  console.log("Decoded ends with:", decoded.substring(decoded.length - 30));
}
