import React, { useState } from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  getStraightPath,
  getBezierPath,
  //   useReactFlow,
} from "@xyflow/react";
import { FaCaretUp, FaCaretDown } from "react-icons/fa";
import { tw } from "twind";

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

  // const onIncrease = (id) => {
  //   console.log("Increase value of edge with id: ", id);
  // };

  // const onDecrease = (id) => {
  //   console.log("Decrease value of edge with id: ", id);
  // };

  return (
    <>
      <BaseEdge id={id} path={edgePath} style={edgeStyle} />
      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            fontSize: 16,
            // everything inside EdgeLabelRenderer has no pointer events by default
            // if you have an interactive element, set pointer-events: all
            pointerEvents: "all",
            backgroundColor: "white",
            paddingLeft: 2,
            border: "1px solid gray",
            // for now always show the label
            display: "flex",
            // display: data?.isHovered ? "flex" : "none", // Example of conditional rendering
            alignItems: "center", // Center items vertically
            justifyContent: "center", // Center items horizontally
          }}
          className="nodrag nopan"
        >
          <span className={tw`text-blue-400`}>×</span>
          {data.value}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <button
              onClick={() => data.onWeightIncrease(id)}
              style={{ marginLeft: "5px" }}
            >
              <FaCaretUp />
            </button>
            <button
              onClick={() => data.onWeightDecrease(id)}
              style={{ marginLeft: "5px" }}
            >
              <FaCaretDown />
            </button>
          </div>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
