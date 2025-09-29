import { io, Socket } from "socket.io-client";
import { socketBaseUrl } from "../utils/constance";

const socketOptions = {
  autoConnect: true,
  reconnection: true,
  reconnectionDelay: 500,
  reconnectionDelayMax: 1000,
  reconnectionAttempts: Infinity,
  transports: ["websocket", "polling"],
};

const socket: Socket = io(socketBaseUrl, socketOptions);

export default socket;
