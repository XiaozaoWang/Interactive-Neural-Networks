import React, { useState, useEffect, useRef } from "react";
import { Handle, Position } from "@xyflow/react";
import { tw } from "twind";
import * as d3 from "d3";

const DragNode = ({ data }) => {
  const svgRef = useRef(null);
  //   const rectHeight = 70;
  const [rectHeight, setRectHeight] = useState(50);
  const rectWidth = 100;

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    const rect = svg
      .append("rect")
      .attr("x", 0)
      .attr("y", 100 - rectHeight)
      .attr("width", rectWidth)
      .attr("height", rectHeight)
      .attr("fill", "lightblue");

    // Add a draggable line on top of the rectangle
    const dragLine = svg
      .append("rect")
      .attr("x", 0)
      .attr("y", 100 - rectHeight - 5)
      .attr("width", rectWidth)
      .attr("height", 5)
      .attr("fill", "darkblue")
      .attr("cursor", "ns-resize")
      .call(d3.drag().on("drag", dragged));

    function dragged(event) {
      const newY = event.y;
      const newHeight = 100 - newY;
      //   console.log("newHeight:", newHeight);

      if (newHeight > 0) {
        // rect.attr("y", newY).attr("height", 100 - newHeight);
        // dragLine.attr("y", newY - 5);
        setRectHeight(newHeight);
        data.onHeightChange(newHeight);
      }
    }
  }, [rectHeight]);

  return (
    <div
      className={tw`w-[100px] h-[100px] p-0 m-0 bg-gray-100 border border-gray-300 rounded-md`}
    >
      <Handle
        type="target"
        position="left"
        className={tw`w-2 h-2 bg-blue-500`}
      />
      <svg ref={svgRef} width="100%" height="100%" />
      <Handle
        type="source"
        position="right"
        className={tw`w-2 h-2 bg-blue-500`}
      />
    </div>
  );
};

export default DragNode;
