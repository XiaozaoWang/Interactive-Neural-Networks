import React, { useState, useEffect, useRef } from "react";
import { Handle, Position } from "@xyflow/react";
import { tw } from "twind";

export default function LrNode({ id, data }) {
  const handleLrChange = (e) => {
    const lr = parseFloat(e.target.value);
    data.handleClick(lr);
  };
  return (
    <>
      <div className={tw`p-0 m-0 bg-gray-50 border border-gray-100 rounded-md`}>
        <select onChange={handleLrChange} className={tw`m-2`}>
          <option value="0.2">0.2</option>
          <option value="0.1">0.1</option>
          <option value="0.05">0.05</option>
          <option defaultValue="0.02">0.02</option>
        </select>
      </div>
    </>
  );
}
