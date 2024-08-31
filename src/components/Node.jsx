import React from "react";
import { Handle, Position } from "@xyflow/react";
import { tw } from "twind";

const Node = ({ data }) => {
  return (
    <div
      className={tw`w-36 h-36 p-4 bg-gray-100 border border-gray-300 rounded-md`}
    >
      <Handle
        type="target"
        position="left"
        className={tw`w-2 h-2 bg-blue-500`}
      />
      <div className={tw`text-center text-sm font-medium`}>
        {Object.entries(data).map(([key, value]) => (
          <div key={key}>
            {key}: {value}
          </div>
        ))}
      </div>
      <Handle
        type="source"
        position="right"
        className={tw`w-2 h-2 bg-blue-500`}
      />
    </div>
  );
};

export default Node;
