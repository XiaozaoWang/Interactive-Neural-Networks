import React, { useEffect, useState } from "react";
import { useSocket } from "../SocketProvider";

export default function PageA() {
  const socket = useSocket();
  const [alpha, setAlpha] = useState(0.5);

  useEffect(() => {
    if (!socket) return;

    socket.on("initialState", (s) => {
      setAlpha(s.sliders?.alpha ?? 0.5);
    });

    socket.on("paramChange", (data) => {
      if (data.path === "sliders.alpha") setAlpha(data.value);
    });

    return () => {
      socket.off("initialState");
      socket.off("paramChange");
    };
  }, [socket]);

  function onChange(e) {
    const v = Number(e.target.value);
    setAlpha(v); // 先本地更新
    // 发给服务器（服务器会广播给其他客户端）
    socket.emit("paramChange", { path: "sliders.alpha", value: v });
  }

  return (
    <div>
      <h2>Page A</h2>
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={alpha}
        onChange={onChange}
      />
      <div>alpha: {alpha}</div>
    </div>
  );
}
