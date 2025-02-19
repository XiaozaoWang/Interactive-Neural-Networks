import React, { useState, useEffect, useRef } from "react";
import { FaCaretUp, FaCaretDown } from "react-icons/fa";

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
        fontSize: "20px",
        color: grad < 0 ? "#6dd2f3" : "#f78574",
      }}
      onClick={() => {
        console.log("clicked222");
      }}
    >
      {grad !== 0 ? grad < 0 ? <FaCaretUp /> : <FaCaretDown /> : null}
    </div>
  );
}
