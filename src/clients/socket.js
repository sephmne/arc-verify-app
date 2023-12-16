import { io } from "socket.io-client";

// "undefined" means the URL will be computed from the `window.location` object
const URL =
  process.env.NODE_ENV === "production"
    ? undefined
    : "viaduct.proxy.rlwy.net:59400";

export const socket = io(URL);
