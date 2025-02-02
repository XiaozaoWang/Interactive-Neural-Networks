import React, { useState, useEffect, useRef } from "react";
import { Handle, Position } from "@xyflow/react";
import { tw } from "twind";

const BiasNode = ({ id, data, isConnectable }) => {
  const nodeWidth = 60;
  const nodeHeight = 40;
  const grayscale = 100;
  return (
    <>
      <div
        className={tw`w-[${nodeWidth}px] h-[${nodeHeight}px] p-0 m-0 bg-gray-${grayscale} border border-gray-200 rounded-md font-bold text-lg flex items-center justify-center`}
      >
        1
      </div>
      <Handle
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
        className={tw`w-2 h-2 bg-blue-400`}
      />
    </>
  );
};

export default BiasNode;
