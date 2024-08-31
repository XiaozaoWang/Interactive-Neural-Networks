import React, { useState } from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  getStraightPath,
  getBezierPath,
  //   useReactFlow,
} from "@xyflow/react";

// import "./edge.css";

export default function Edge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data,
}) {
  //   const { setEdges } = useReactFlow(); // Accessing parent flow, 之后研究
  const [isHovered, setIsHovered] = useState(false);
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  let edgeStyle = {};
  if (data.value > 0) {
    edgeStyle = {
      // stroke: data?.isHovered ? "blue" : "black", // Example of changing the stroke color
      // strokeWidth: 3, // Example of changing the stroke width
      stroke: data?.isHovered ? "#6dd2f3" : "#aedfef",
      strokeWidth: 0.5 + data.value * 4,
      ...style,
    };
  } else {
    edgeStyle = {
      // stroke: data?.isHovered ? "blue" : "black", // Example of changing the stroke color
      // strokeWidth: 3, // Example of changing the stroke width
      stroke: data?.isHovered ? "#f78574" : "#f6b4aa",
      strokeWidth: 0.5 + Math.abs(data.value) * 4,
      ...style,
    };
  }

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
          {data.value}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
