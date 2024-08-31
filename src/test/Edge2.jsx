// components/Edge2.jsx
import React, { useState } from "react";
import { BaseEdge, EdgeLabelRenderer, getStraightPath } from "@xyflow/react";

const Edge2 = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  label,
  data,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [edgePath, labelX, labelY] = getStraightPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  const edgeStyle = {
    stroke: data?.isHovered ? "blue" : "black", // Example of changing the stroke color
    strokeWidth: 3, // Example of changing the stroke width
    ...style,
  };

  return (
    <>
      <BaseEdge id={id} path={edgePath} style={edgeStyle} />
      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            fontSize: 12,
            // everything inside EdgeLabelRenderer has no pointer events by default
            // if you have an interactive element, set pointer-events: all
            pointerEvents: "all",
            backgroundColor: "white",
            display: data?.isHovered ? "block" : "none", // Example of conditional rendering
          }}
          className="nodrag nopan"
        >
          3.14
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

export default Edge2;
