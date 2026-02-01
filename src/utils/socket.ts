import { io, type Socket } from "socket.io-client";

const getSocketUrl = () => {
  const envSocket = import.meta.env.VITE_SOCKET_URL as string | undefined;
  const envApi = import.meta.env.VITE_API_URL as string | undefined;

  if (envSocket && envSocket.length > 0) return envSocket;

  if (envApi && envApi.length > 0) {
    if (envApi.startsWith("/")) {
      return window.location.origin;
    }

    const stripped = envApi.replace(/\/api\/v1\/?$/, "");
    if (stripped.length > 0) return stripped;
  }

  return "http://localhost:3000";
};

export const createSocket = (): Socket =>
  io(getSocketUrl(), {
    transports: ["websocket"],
    withCredentials: true,
  });
