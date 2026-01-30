import Echo from "laravel-echo";
import Pusher from "pusher-js";

window.Pusher = Pusher;

export const createEcho = (token) => {
  return new Echo({
    broadcaster: "pusher",

    key: import.meta.env.VITE_PUSHER_APP_KEY,
    cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,

    wsHost: import.meta.env.VITE_PUSHER_HOST,
    wsPort: Number(import.meta.env.VITE_PUSHER_PORT || 80),
    wssPort: Number(import.meta.env.VITE_PUSHER_PORT || 443),

    forceTLS: true,
    encrypted: true,

    enabledTransports: ["ws", "wss"],

    authEndpoint: `${import.meta.env.VITE_API_URL}api/broadcasting/auth`,

    auth: {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    },
  });
};
