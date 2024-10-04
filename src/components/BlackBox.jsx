import React, { useState, useEffect, useRef } from "react";
import { Handle, Position } from "@xyflow/react";
import { tw } from "twind";
import * as d3 from "d3";

const BlackBox = ({ data, isConnectable }) => {
  const svgRef = useRef(null);
  const nodeWidth = 200;
  const nodeHeight = 200;
  return (
    <>
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
      />
      <div
        className={tw`w-[${nodeWidth}px] h-[${nodeHeight}px] p-0 m-0 bg-gray-100 border border-gray-300 rounded-md flex items-center justify-center`}
      >
        {/* <svg ref={svgRef} width="100%" height="100%" /> */}
        <p>?</p>
      </div>
      <Handle
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
      />
    </>
  );
};

export default BlackBox;
