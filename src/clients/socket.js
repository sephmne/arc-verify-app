import { io } from "socket.io-client";

// "undefined" means the URL will be computed from the `window.location` object
const URL =
  process.env.NODE_ENV === "production"
    ? "https://arc-verify-server-production.up.railway.app:443"
    : "http://localhost:4000";

export const socket = io(URL);
