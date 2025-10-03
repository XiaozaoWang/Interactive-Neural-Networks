import React, { useEffect, useState } from "react";
import { useSocket } from "../SocketProvider";

export default function PageB() {
  const socket = useSocket();
  const [alpha, setAlpha] = useState(0.5);

  useEffect(() => {
    if (!socket) return;
    socket.on("initialState", (s) => setAlpha(s.sliders?.alpha ?? 0.5));
    socket.on("paramChange", (data) => {
      if (data.path === "sliders.alpha") setAlpha(data.value);
    });
    return () => {
      socket.off("initialState");
      socket.off("paramChange");
    };
  }, [socket]);

  return (
    <div>
      <h2>Page B</h2>
      <div>alpha: {alpha}</div>
    </div>
  );
}
