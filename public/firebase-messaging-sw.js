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

  function resolveNotificationLink(data) {
    if (typeof data.deepLink === "string" && data.deepLink.trim()) {
      return data.deepLink;
    }
    if (typeof data.link === "string" && data.link.trim()) {
      return data.link;
    }
    if (typeof data.appointmentId === "string" && data.appointmentId.trim()) {
      return `/appointments/${data.appointmentId}`;
    }
    return "/notifications";
  }

  messaging.onBackgroundMessage((payload) => {
    const notification = payload.notification || {};
    const data = payload.data || {};

    const title = notification.title || "Notification";
    const options = {
      body: notification.body || "",
      data: {
        link: resolveNotificationLink(data),
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
  const targetUrl = new URL(link, self.location.origin).toString();

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      const sameOriginClient = windowClients.find((client) =>
        typeof client.url === "string" && client.url.startsWith(self.location.origin),
      );

      if (sameOriginClient && "focus" in sameOriginClient) {
        return sameOriginClient.focus().then(() => {
          if ("navigate" in sameOriginClient) {
            return sameOriginClient.navigate(targetUrl);
          }
          return undefined;
        });
      }

      return clients.openWindow(targetUrl);
    }),
  );
});
