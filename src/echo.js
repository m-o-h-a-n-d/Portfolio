import Echo from "laravel-echo";
import Pusher from "pusher-js";
import { getAuthToken } from "./api/request";

window.Pusher = Pusher;

const env = import.meta.env;

const echo = new Echo({
  broadcaster: "pusher",

  key: env.VITE_PUSHER_APP_KEY,
  cluster: env.VITE_PUSHER_APP_CLUSTER,

  // مهم في Production
  forceTLS: true,
  encrypted: true,

  // WebSocket settings
  wsHost: env.VITE_PUSHER_HOST,              // ws-mt1.pusher.com
  wsPort: Number(env.VITE_PUSHER_PORT || 80),
  wssPort: Number(env.VITE_PUSHER_PORT || 443),

  enabledTransports: ["ws", "wss"],

  // Auth endpoint (خليه من env)
  authEndpoint: `${env.VITE_API_URL}api/broadcasting/auth`,

  auth: {
    headers: {
      Authorization: `Bearer ${getAuthToken()}`,
      Accept: "application/json",
    },
  },
});

export default echo;
