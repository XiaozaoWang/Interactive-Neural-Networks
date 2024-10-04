import React, { useState, useEffect, useRef } from "react";
import { Handle, Position } from "@xyflow/react";
import { tw } from "twind";
import * as d3 from "d3";

const DragNode = ({ id, data, isConnectable }) => {
  const svgRef = useRef(null);
  const [nodeValue, setNodeValue] = useState(data.value);
  const nodeWidth = 20;
  const nodeHeight = 100;
  const scale = d3.scaleLinear().domain([0, 1]).range([0, 100]);
  const [height, setHeight] = useState(scale(nodeValue)); // Keep track of the current height
  const [isDragging, setIsDragging] = useState(false);

  // Effect to update the height smoothly when data.value changes
  useEffect(() => {
    const svg = d3.select(svgRef.current);

    // Transition the rectangle to the new height and y position
    svg
      .select("rect.node-rect")
      .transition()
      .duration(isDragging ? 0 : 200) // Add transition while selection changed, No transition when dragging
      .attr("y", nodeHeight - scale(data.value)) // Transition to the new height
      .attr("height", scale(data.value)); // Transition to the new y position

    // Transition the draggable line to the new y position
    svg
      .select("rect.drag-line")
      .transition()
      .duration(isDragging ? 0 : 200)
      .attr("y", nodeHeight - scale(data.value) - 5);

    setHeight(scale(data.value)); // Update height after transition completes
  }, [data.value]); // Depend only on data.value (passed from parent)

  // Effect to render the SVG graphic initially and after dragging
  useEffect(() => {
    // console.log("current height:", height);
    const svg = d3.select(svgRef.current);

    // Create the rectangle if it doesn't exist yet
    let rect = svg.select("rect.node-rect");
    if (rect.empty()) {
      rect = svg
        .append("rect")
        .attr("class", "node-rect")
        .attr("x", 0)
        .attr("y", nodeHeight - height) // Initial height
        .attr("width", nodeWidth)
        .attr("height", height)
        .attr("fill", "#FCF297");
    }

    // Create the draggable line if it doesn't exist yet
    let dragLine = svg.select("rect.drag-line");
    if (dragLine.empty()) {
      dragLine = svg
        .append("rect")
        .attr("class", "drag-line")
        .attr("x", 0)
        .attr("y", nodeHeight - height - 5) // Initial position for the drag line
        .attr("width", nodeWidth)
        .attr("height", 5)
        .attr("fill", "#FF9100")
        .attr("cursor", "ns-resize")
        .call(d3.drag().on("drag", dragged).on("end", dragEnded));
    }

    function dragged(event) {
      setIsDragging(true);
      const newY = event.y;
      const newHeight = nodeHeight - newY;

      if (newHeight > 0) {
        setHeight(newHeight); // Update height in state for immediate effect
        setNodeValue(scale.invert(newHeight).toFixed(2)); // Update the node value
        console.log("id:", id);
        const idx = id.split("input")[1] - 1; // get the index of the input node
        data.onValueChange(idx, scale.invert(newHeight).toFixed(2)); // Update the value in parent
      }
    }

    function dragEnded(event) {
      setIsDragging(false);
    }
  }, [height]); // Depend on height for initial rendering and dragging

  return (
    <>
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
      />
      <div
        className={tw`w-[${nodeWidth}px] h-[${nodeHeight}px] p-0 m-0 bg-gray-100 border border-gray-300 rounded-md`}
      >
        <svg ref={svgRef} width="100%" height="100%" />
      </div>
      <Handle
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
      />
    </>
  );
};

export default DragNode;
