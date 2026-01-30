import Echo from "laravel-echo";
import Pusher from "pusher-js";

window.Pusher = Pusher;

export const createEcho = (token) => {
  const env = import.meta.env;

  return new Echo({
    broadcaster: "pusher",
    key: env.VITE_PUSHER_APP_KEY,
    cluster: env.VITE_PUSHER_APP_CLUSTER,

    wsHost: env.VITE_PUSHER_HOST,
    wsPort: Number(env.VITE_PUSHER_PORT || 80),
    wssPort: Number(env.VITE_PUSHER_PORT || 443),

    forceTLS: true,
    encrypted: true,
    enabledTransports: ["ws", "wss"],

    authEndpoint: `${env.VITE_API_URL}api/broadcasting/auth`,
    auth: {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    },
  });
};
