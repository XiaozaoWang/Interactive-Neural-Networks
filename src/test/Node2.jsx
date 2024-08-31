// components/Node2.jsx
import React from "react";
import { Handle, Position } from "@xyflow/react";
import { tw } from "twind";

const Node2 = ({ data }) => {
  const handleMouseEnter = () => {
    console.log("Mouse entered the node");
  };

  return (
    <div
      className={tw`w-36 p-4 bg-gray-100 border border-gray-300 rounded-md`}
      onMouseEnter={handleMouseEnter} // Add this line
    >
      <Handle
        type="target"
        position={Position.Left}
        className={tw`w-2 h-2 bg-blue-500`}
      />
      <div className={tw`text-center text-sm font-medium`}>{data.label}!</div>
      <Handle
        type="source"
        position={Position.Right}
        className={tw`w-2 h-2 bg-blue-500`}
      />
    </div>
  );
};

export default Node2;
