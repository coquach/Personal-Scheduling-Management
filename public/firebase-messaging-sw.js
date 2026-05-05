importScripts("https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js");

const params = new URLSearchParams(self.location.search);

const firebaseConfig = {
  apiKey: params.get("apiKey"),
  authDomain: params.get("authDomain"),
  projectId: params.get("projectId"),
  messagingSenderId: params.get("messagingSenderId"),
  appId: params.get("appId"),
};

const hasRequiredConfig = Object.values(firebaseConfig).every(
  (value) => typeof value === "string" && value.length > 0,
);

if (hasRequiredConfig) {
  firebase.initializeApp(firebaseConfig);
  const messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    const notification = payload.notification || {};
    const data = payload.data || {};

    const title = notification.title || "Notification";
    const options = {
      body: notification.body || "",
      data: {
        link: data.link || data.deepLink || "/notifications",
      },
    };

    self.registration.showNotification(title, options);
  });
}

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const link =
    event.notification?.data?.link && typeof event.notification.data.link === "string"
      ? event.notification.data.link
      : "/notifications";

  event.waitUntil(clients.openWindow(link));
});
