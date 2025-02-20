import React, { useState, useEffect, useRef } from "react";
import { ImArrowUp, ImArrowDown } from "react-icons/im";

export default function Arrow({ grad, labelX, labelY }) {
  return (
    <div
      style={{
        position: "absolute",
        left: `${labelX}px`,
        top: `${labelY - 30}px`,
        transform: "translate(-50%, -50%)",
        cursor: "pointer",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        // fontSize: "20px",
        fontSize: `${Math.min(30, 10 + Math.abs(grad) * 20)}px`,
        color: grad < 0 ? "#6dd2f3" : "#f78574",
        pointerEvents: "auto",
      }}
      onClick={() => {
        console.log("clicked on grad");
      }}
    >
      {grad !== 0 ? grad < 0 ? <ImArrowUp /> : <ImArrowDown /> : null}
    </div>
  );
}
