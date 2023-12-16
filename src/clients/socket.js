import { io } from "socket.io-client";

// "undefined" means the URL will be computed from the `window.location` object
const URL =
  process.env.NODE_ENV === "production"
    ? "viaduct.proxy.rlwy.net:59400"
    : "http://localhost:4000";

export const socket = io(URL);
