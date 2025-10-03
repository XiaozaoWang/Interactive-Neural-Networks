// src/SocketProvider.jsx
import React, { createContext, useContext, useMemo, useEffect } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const socket = useMemo(() => {
    // 改成你 server 的地址
    return io("http://localhost:4000", { transports: ["websocket"] });
  }, []);

  useEffect(() => {
    socket.connect();
    socket.on("connect", () => console.log("socket connected", socket.id));
    socket.on("connect_error", (err) =>
      console.error("socket connect_error", err)
    );
    return () => {
      socket.disconnect();
    };
  }, [socket]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
