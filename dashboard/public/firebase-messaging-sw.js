// Handles push notifications while no tab is focused. Runs as a raw
// service worker (not a Next.js module), so it uses the compat SDK via
// importScripts rather than ESM imports. The config below is the public
// Firebase web config — safe to inline, Firebase security is enforced
// server-side, not by hiding these values.
importScripts("https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyDSTbkKhfqKXXcRYNYYbVOh2oa4VTAWT5E",
  authDomain: "a-plus-ee745.firebaseapp.com",
  projectId: "a-plus-ee745",
  storageBucket: "a-plus-ee745.firebasestorage.app",
  messagingSenderId: "904647498625",
  appId: "1:904647498625:web:4934dfeaef55e150e52680",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || "A+ Laboratory";
  const body = payload.notification?.body || "";
  self.registration.showNotification(title, {
    body,
    icon: "/brand/logo.png",
  });
});
