import React, { useState, useEffect } from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  getStraightPath,
  getBezierPath,
  //   useReactFlow,
} from "@xyflow/react";
import { FaCaretUp, FaCaretDown } from "react-icons/fa";
import { tw } from "twind";

export default function NormalEdge({
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
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  const [isGlowing, setIsGlowing] = useState(false);

  let edgeStyle = {
    strokeWidth: 1.5,
    filter: isGlowing ? "drop-shadow(0px 0px 3px rgb(255, 208, 0, 1))" : "none",
    ...style,
  };

  //   useEffect(() => {
  //     if (data.glowingEle === id) {
  //       setIsGlowing(true);
  //     } else {
  //       setIsGlowing(false);
  //     }
  //   }, [data.glowingEle]);

  return (
    <>
      <BaseEdge id={id} path={edgePath} style={edgeStyle} />
    </>
  );
}
