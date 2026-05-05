import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';

const rootDir = process.cwd();

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  return dotenv.parse(fs.readFileSync(filePath));
}

const baseEnv = loadEnvFile(path.join(rootDir, '.env'));
const localEnv = loadEnvFile(path.join(rootDir, '.env.local'));
const env = {
  ...baseEnv,
  ...localEnv,
};

const requiredEnvKeys = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
  'VITE_FIREBASE_MEASUREMENT_ID',
];

const missingKeys = requiredEnvKeys.filter((key) => !env[key]);
if (missingKeys.length > 0) {
  throw new Error(`Missing Firebase environment variables: ${missingKeys.join(', ')}`);
}

const outputPath = path.join(rootDir, 'public', 'firebase-messaging-sw.generated.js');
const generated = `// Generated from environment variables. Do not edit directly.
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: ${JSON.stringify(env.VITE_FIREBASE_API_KEY)},
  authDomain: ${JSON.stringify(env.VITE_FIREBASE_AUTH_DOMAIN)},
  projectId: ${JSON.stringify(env.VITE_FIREBASE_PROJECT_ID)},
  storageBucket: ${JSON.stringify(env.VITE_FIREBASE_STORAGE_BUCKET)},
  messagingSenderId: ${JSON.stringify(env.VITE_FIREBASE_MESSAGING_SENDER_ID)},
  appId: ${JSON.stringify(env.VITE_FIREBASE_APP_ID)}
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.generated.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/favicon.ico',
    badge: '/favicon.ico'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow('/'));
});
`;

fs.writeFileSync(outputPath, generated);
console.log(`Generated ${outputPath}`);
