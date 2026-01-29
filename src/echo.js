import Echo from "laravel-echo";
import Pusher from "pusher-js";
import { getAuthToken } from "./api/request";

window.Pusher = Pusher;

const env = import.meta.env;
const echoOptions = {
  broadcaster: "pusher",
  key: env.VITE_PUSHER_APP_KEY,
  cluster: env.VITE_PUSHER_APP_CLUSTER,
  forceTLS: (env.VITE_PUSHER_SCHEME || "https") === "https",
  enabledTransports: ["ws", "wss"],
  authEndpoint: "https://portfoliomo.up.railway.app/api/broadcasting/auth",
  auth: {
    headers: {
      Authorization: `Bearer ${getAuthToken()}`,
      Accept: "application/json"
    }
  }
};

if (env.VITE_PUSHER_HOST) {
  echoOptions.wsHost = env.VITE_PUSHER_HOST;
}

if (env.VITE_PUSHER_PORT) {
  const port = Number(env.VITE_PUSHER_PORT);
  if (!Number.isNaN(port)) {
    echoOptions.wsPort = port;
    echoOptions.wssPort = port;
  }
}

const echo = new Echo(echoOptions);

export default echo;
