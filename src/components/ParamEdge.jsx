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

  const [isGlowing, setIsGlowing] = useState(false);
  const [grad, setGrad] = useState(0);
  const [clicked, setClicked] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [highlightedId, setHighlightedId] = useState([]);
  const arrowRef = useRef(null);
  const arrowAreaWidth = 20;
  const arrowAreaHeight = 30;
  const RED = "#aedfef";
  const D_RED = "#0288b5"; // dark red
  const BLUE = "#f6b4aa";
  const D_BLUE = "#d9331a";

  useEffect(() => {
    if (data.nnData.length !== 0) {
      // console.log("layerIndex", data.layerIndex, data.neuronIndex);
      let gradRoot;
      if (data.layerIndex && data.neuronIndex) {
        gradRoot = data.nnData.layers[data.layerIndex][data.neuronIndex];
      } else {
        gradRoot = data.nnData.layers[0][0];
      }

      // console.log(
      //   "gradroot",
      //   data.nnData.layers[data.layerIndex][data.neuronIndex]
      // );
      // console.log("gradRoot", gradRoot);
      if (id.includes("w")) {
        // console.log(gradRoot.gradw);
        // console.log(id.length);
        // console.log("1", gradRoot.gradw[id[5]]);
        if (id.length === 5) {
          // console.log(gradRoot.gradw[id[4]]);
          setGrad(gradRoot.gradw[id[4] - 1]);
        } else {
          setGrad(gradRoot.gradw[id[5]]);
        }
      } else if (id.includes("b")) {
        // console.log("2", gradRoot.gradb);
        setGrad(gradRoot.gradb);
      }
    }
  }, [data.nnData]);

  let edgeStyle = {
    stroke:
      data?.isHovered || data.glowingEle.includes(id)
        ? data.value > 0
          ? D_RED
          : D_BLUE
        : data.value > 0
        ? RED
        : BLUE,
    strokeWidth: 1 + Math.abs(data.value) * 4,
    filter: isGlowing
      ? "drop-shadow(0px 0px 3px rgba(255, 208, 0, 1))"
      : "none",
    ...style,
  };

  const handleGradArrowClick = () => {
    if (data.clickedGrad === id) {
      data.onGradArrowClick(null); // Deselect if already selected
    } else {
      console.log("setting", id);
      data.onGradArrowClick(id); // Select if not already selected
    }
  };

  // useEffect(() => {
  //   console.log("data.clickedGrad", data.clickedGrad);
  // }, [data.clickedGrad]);

  useEffect(() => {
    // if (data.glowingEle === id) {
    //   setIsGlowing(true);
    // } else {
    //   setIsGlowing(false);
    // }
    // console.log(id, data.glowingEle);
    if (data.glowingEle && data.glowingEle.includes(id)) {
      // console.log(id, "is glowing");
      setIsGlowing(true);
    } else {
      setIsGlowing(false);
    }
  }, [data.glowingEle]);

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
            visibility: data.showLabel ? "visible" : "hidden",
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

        {!data.showLabel && data.isHovered && (
          <div
            style={{
              position: "absolute",
              left: `${labelX}px`,
              top: `${labelY}px`,
              transform: "translate(-50%, -50%)",
              backgroundColor: "rgba(255,255,255, 0.7)",
              color: "clack",
              padding: "5px 10px",
              borderRadius: "5px",
              fontSize: "12px",
              pointerEvents: "none",
            }}
          >
            {data.value}
          </div>
        )}
        {/* <Arrow grad={grad} labelX={labelX} labelY={labelY} /> */}
        <div
          style={{
            position: "absolute",
            left: `${labelX}px`,
            top: data.showLabel ? `${labelY - 30}px` : `${labelY - 5}px`,
            transform: "translate(-50%, -50%)",
            cursor: "pointer",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            // fontSize: "20px",
            fontSize: `${Math.min(30, 10 + Math.abs(grad) * 20)}px`,
            color:
              data.clickedGrad === id
                ? grad > 0
                  ? D_RED
                  : D_BLUE
                : grad > 0
                ? RED
                : BLUE,
            pointerEvents: "auto", // ensure it handles click
          }}
          onClick={handleGradArrowClick}
        >
          {grad !== 0 && grad !== undefined ? (
            grad < 0 ? (
              <ImArrowUp />
            ) : (
              <ImArrowDown />
            )
          ) : null}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
