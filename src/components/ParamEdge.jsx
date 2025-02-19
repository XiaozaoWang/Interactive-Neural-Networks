// Nothing outside the area of the edge and label can be detected and clicked.

// hovering detection comes from parent!!!

import React, { useState, useEffect, useRef } from "react";
import { BaseEdge, EdgeLabelRenderer, getBezierPath } from "@xyflow/react";
import * as d3 from "d3";
import { FaCaretUp, FaCaretDown } from "react-icons/fa";
import { ImArrowUp, ImArrowDown } from "react-icons/im";
import { tw } from "twind";
import Arrow from "./Arrow";

export default function ParamEdge({
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
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  const [isGlowing, setIsGlowing] = useState(true);
  const [grad, setGrad] = useState(0);
  const [showTooltip, setShowTooltip] = useState(false);
  const [highlightedId, setHighlightedId] = useState([]);
  const arrowRef = useRef(null);
  const arrowAreaWidth = 20;
  const arrowAreaHeight = 30;

  useEffect(() => {
    if (data.nnData.length !== 0) {
      let gradRoot = data.nnData.layers[0][0];
      if (id.includes("w")) {
        setGrad(gradRoot.gradw[id[4] - 1]);
      } else if (id.includes("b")) {
        setGrad(gradRoot.gradb);
      }
    }
  }, [data.nnData]);

  let edgeStyle = {
    stroke: data?.isHovered
      ? data.value > 0
        ? "#6dd2f3"
        : "#f78574"
      : data.value > 0
      ? "#aedfef"
      : "#f6b4aa",
    strokeWidth: 0.5 + Math.abs(data.value) * 4,
    filter: isGlowing
      ? "drop-shadow(0px 0px 3px rgba(255, 208, 0, 1))"
      : "none",
    ...style,
  };

  useEffect(() => {
    if (data.glowingEle === id) {
      setIsGlowing(true);
    } else {
      setIsGlowing(false);
    }
  }, [data.glowingEle]);

  useEffect(() => {
    if (arrowRef.current) {
      const svg = d3.select(arrowRef.current);
      svg.selectAll("*").remove();
      svg.attr("width", arrowAreaWidth).attr("height", arrowAreaHeight);

      if (grad !== 0) {
        const scale = Math.min(1, Math.max(0.4, Math.abs(grad)));
        const color = grad < 0 ? "#6dd2f3" : "#f78574";

        const arrowGroup = svg
          .append("g")
          .attr(
            "transform",
            `translate(${arrowAreaWidth / 2}, ${
              arrowAreaHeight / 2
            }) scale(${scale})`
          );

        arrowGroup
          .append("line")
          .attr("x1", 0)
          .attr("y1", grad < 0 ? 5 : -5)
          .attr("x2", 0)
          .attr("y2", grad < 0 ? -10 : 10)
          .attr("stroke", color)
          .attr("stroke-width", 5);

        arrowGroup
          .append("polygon")
          .attr("points", "-8,0 8,0 0,-8")
          .attr(
            "transform",
            grad < 0 ? "translate(0,-10)" : "translate(0,10) rotate(180)"
          )
          .attr("fill", color);
      }
    }
  }, [grad]);

  const handleHover = (id) => {
    console.log("hovering", id);
    setHighlightedId(id);
    data.onParamHover(id);
  };

  const handleMouseLeave = () => {
    setHighlightedId(null);
    data.onParamHover(null);
  };

  return (
    <>
      <BaseEdge id={id} path={edgePath} style={edgeStyle} />
      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            fontSize: 16,
            pointerEvents: "auto",
            backgroundColor: "white",
            paddingLeft: 2,
            border: "1px solid gray",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          className="nodrag nopan"
          onClick={() => {
            console.log("clicked111");
          }}
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

        {/* <Arrow grad={grad} labelX={labelX} labelY={labelY} /> */}
      </EdgeLabelRenderer>
    </>
  );
}

// svg version

// import React, { useState, useEffect, useRef } from "react";
// import { BaseEdge, EdgeLabelRenderer, getBezierPath } from "@xyflow/react";
// import * as d3 from "d3";
// import { FaCaretUp, FaCaretDown } from "react-icons/fa";
// import { tw } from "twind";

// export default function ParamEdge({
//   id,
//   sourceX,
//   sourceY,
//   targetX,
//   targetY,
//   sourcePosition,
//   targetPosition,
//   style = {},
//   data,
// }) {
//   const [edgePath, labelX, labelY] = getBezierPath({
//     sourceX,
//     sourceY,
//     targetX,
//     targetY,
//     sourcePosition,
//     targetPosition,
//   });

//   const [isGlowing, setIsGlowing] = useState(true);
//   const [grad, setGrad] = useState(0);
//   const [showTooltip, setShowTooltip] = useState(false);
//   const [highlightedId, setHighlightedId] = useState([]);
//   const arrowRef = useRef(null);
//   const arrowAreaWidth = 20;
//   const arrowAreaHeight = 30;

//   useEffect(() => {
//     if (data.nnData.length !== 0) {
//       let gradRoot = data.nnData.layers[0][0];
//       if (id.includes("w")) {
//         setGrad(gradRoot.gradw[id[4] - 1]);
//       } else if (id.includes("b")) {
//         setGrad(gradRoot.gradb);
//       }
//     }
//   }, [data.nnData]);

//   let edgeStyle = {
//     stroke: data?.isHovered
//       ? data.value > 0
//         ? "#6dd2f3"
//         : "#f78574"
//       : data.value > 0
//       ? "#aedfef"
//       : "#f6b4aa",
//     strokeWidth: 0.5 + Math.abs(data.value) * 4,
//     filter: isGlowing
//       ? "drop-shadow(0px 0px 3px rgba(255, 208, 0, 1))"
//       : "none",
//     ...style,
//   };

//   useEffect(() => {
//     if (data.glowingEle === id) {
//       setIsGlowing(true);
//     } else {
//       setIsGlowing(false);
//     }
//   }, [data.glowingEle]);

//   useEffect(() => {
//     if (arrowRef.current) {
//       const svg = d3.select(arrowRef.current);
//       svg.selectAll("*").remove();
//       svg.attr("width", arrowAreaWidth).attr("height", arrowAreaHeight);

//       if (grad !== 0) {
//         const scale = Math.min(1, Math.max(0.4, Math.abs(grad)));
//         const color = grad < 0 ? "#6dd2f3" : "#f78574";

//         const arrowGroup = svg
//           .append("g")
//           .attr(
//             "transform",
//             `translate(${arrowAreaWidth / 2}, ${
//               arrowAreaHeight / 2
//             }) scale(${scale})`
//           );

//         arrowGroup
//           .append("line")
//           .attr("x1", 0)
//           .attr("y1", grad < 0 ? 5 : -5)
//           .attr("x2", 0)
//           .attr("y2", grad < 0 ? -10 : 10)
//           .attr("stroke", color)
//           .attr("stroke-width", 5);

//         arrowGroup
//           .append("polygon")
//           .attr("points", "-8,0 8,0 0,-8")
//           .attr(
//             "transform",
//             grad < 0 ? "translate(0,-10)" : "translate(0,10) rotate(180)"
//           )
//           .attr("fill", color);
//       }
//     }
//   }, [grad]);

//   const handleHover = (id) => {
//     console.log("hovering", id);
//     setHighlightedId(id);
//     data.onParamHover(id);
//   };

//   const handleMouseLeave = () => {
//     setHighlightedId(null);
//     data.onParamHover(null);
//   };

//   return (
//     <>
//       <BaseEdge id={id} path={edgePath} style={edgeStyle} />
//       <EdgeLabelRenderer>
//         <div
//           style={{
//             position: "absolute",
//             transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
//             fontSize: 16,
//             pointerEvents: "auto",
//             backgroundColor: "white",
//             paddingLeft: 2,
//             border: "1px solid gray",
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//           }}
//           className="nodrag nopan"
//           onClick={() => {
//             console.log("clicked111");
//           }}
//         >
//           <span className={tw`text-blue-400`}>×</span>
//           {data.value}
//           <div
//             style={{
//               display: "flex",
//               flexDirection: "column",
//               justifyContent: "center",
//               alignItems: "center",
//             }}
//           >
//             <button
//               onClick={() => data.onWeightIncrease(id)}
//               style={{ marginLeft: "5px" }}
//             >
//               <FaCaretUp />
//             </button>
//             <button
//               onClick={() => data.onWeightDecrease(id)}
//               style={{ marginLeft: "5px" }}
//             >
//               <FaCaretDown />
//             </button>
//           </div>
//         </div>

//         <div
//           style={{
//             position: "absolute",
//             left: `${labelX}px`,
//             top: `${labelY - 30}px`,
//             transform: "translate(-50%, -50%)",
//             cursor: "pointer",
//           }}
//         >
//           <svg ref={arrowRef} width="20" height="30">
//             <rect width="20" height="30" fill="transparent" />
//           </svg>
//         </div>
//       </EdgeLabelRenderer>
//     </>
//   );
// }
