/**
 * create-admin.mjs
 * One-time script to create the first admin user in Firebase Auth.
 * Run with: node create-admin.mjs
 *
 * Reads VITE_FIREBASE_* variables from frontend/.env.local automatically.
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Read .env.local ───────────────────────────────────────────
const envPath = resolve(__dirname, 'frontend/.env.local');
let envText;
try {
  envText = readFileSync(envPath, 'utf-8');
} catch {
  console.error('❌  Could not read frontend/.env.local — make sure it exists and has your Firebase credentials.');
  process.exit(1);
}

function getEnv(key) {
  const match = envText.match(new RegExp(`^${key}=(.+)$`, 'm'));
  return match ? match[1].trim() : null;
}

const API_KEY      = getEnv('VITE_FIREBASE_API_KEY');
const PROJECT_ID   = getEnv('VITE_FIREBASE_PROJECT_ID');

if (!API_KEY || API_KEY.includes('REPLACE')) {
  console.error('❌  VITE_FIREBASE_API_KEY is not set in frontend/.env.local');
  console.error('   Please fill in your Firebase credentials first.');
  process.exit(1);
}

// ── Admin credentials to create ───────────────────────────────
const ADMIN_EMAIL    = 'admin@rfid.local';
const ADMIN_PASSWORD = 'Admin@1234';

// ── Create user via Firebase Auth REST API ────────────────────
const url = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${API_KEY}`;

console.log(`\n🔥  Firebase Project: ${PROJECT_ID}`);
console.log(`📧  Creating admin user: ${ADMIN_EMAIL}`);
console.log('⏳  Sending request...\n');

const res = await fetch(url, {
  method:  'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email:             ADMIN_EMAIL,
    password:          ADMIN_PASSWORD,
    returnSecureToken: true,
  }),
});

const data = await res.json();

if (data.error) {
  if (data.error.message === 'EMAIL_EXISTS') {
    console.log('⚠️   Admin user already exists — you can log in directly.');
  } else {
    console.error('❌  Error:', data.error.message);
    console.error('   Check your API key and Firebase project settings.');
    process.exit(1);
  }
} else {
  console.log('✅  Admin user created successfully!\n');
}

console.log('─────────────────────────────────────────');
console.log('  Login credentials for the web app:');
console.log('─────────────────────────────────────────');
console.log(`  Email    : ${ADMIN_EMAIL}`);
console.log(`  Password : ${ADMIN_PASSWORD}`);
console.log(`  URL      : http://localhost:3001/login`);
console.log('─────────────────────────────────────────');
console.log('\n🔒  Change this password after first login via Firebase Console.');
console.log('    console.firebase.google.com → Authentication → Users\n');
