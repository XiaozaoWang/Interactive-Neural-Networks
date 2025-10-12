// src/SocketProvider.jsx
import React, {
  createContext,
  useContext,
  useMemo,
  useEffect,
  useState,
} from "react";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState("connecting");

  useEffect(() => {
    // 动态确定服务器地址
    const getServerUrl = () => {
      if (
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1"
      ) {
        return "http://localhost:4000";
      }
      return `http://${window.location.hostname}:4000`;
    };

    const serverUrl = getServerUrl();
    console.log("🔗 Connecting to:", serverUrl);

    const newSocket = io(serverUrl, {
      transports: ["websocket", "polling"],
      timeout: 10000,
    });

    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("✅ Socket connected:", newSocket.id);
      setConnectionStatus("connected");
    });

    newSocket.on("connect_error", (err) => {
      console.error("❌ Socket connection failed:", err);
      setConnectionStatus("error");
    });

    newSocket.on("disconnect", () => {
      setConnectionStatus("disconnected");
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // 返回原始的 socket 对象，保持向后兼容
  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

export const useSocket = () => {
  const socket = useContext(SocketContext);

  if (socket === undefined) {
    throw new Error("useSocket must be used within a SocketProvider");
  }

  return socket;
};

// // src/SocketProvider.jsx
// import React, { createContext, useContext, useMemo, useEffect } from "react";
// import { io } from "socket.io-client";

// const SocketContext = createContext(null);

// export const SocketProvider = ({ children }) => {
//   const socket = useMemo(() => {
//     return io("http://localhost:4000", { transports: ["websocket"] });
//   }, []);

//   useEffect(() => {
//     socket.connect();
//     socket.on("connect", () => console.log("socket connected", socket.id));
//     socket.on("connect_error", (err) =>
//       console.error("socket connect_error", err)
//     );
//     return () => {
//       socket.disconnect();
//     };
//   }, [socket]);

//   return (
//     <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
//   );
// };

// export const useSocket = () => useContext(SocketContext);
