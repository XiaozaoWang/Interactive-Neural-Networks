import React, { useEffect, useState } from "react";
import { useSocket } from "../SocketProvider";

export default function PageC() {
  const socket = useSocket();
  const [alpha, setAlpha] = useState(0);

  useEffect(() => {
    if (!socket) return;

    socket.on("initialState", (s) => setAlpha(s.sliders?.alpha ?? 0));
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
      <h2>Page C</h2>
      <div>Arduino Slider Value: {alpha}</div>
      <input
        type="range"
        min="0"
        max="680"
        value={alpha}
        readOnly
        style={{ width: "300px" }}
      />
    </div>
  );
}
