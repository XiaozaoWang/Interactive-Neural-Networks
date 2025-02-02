import React, { useState, useEffect, useRef } from "react";
import { Handle, Position } from "@xyflow/react";
import { tw } from "twind";
import * as d3 from "d3";

const SliderNode = ({ id, data, isConnectable }) => {
  const svgRef = useRef(null);
  const [nodeValue, setNodeValue] = useState(data.value);
  const nodeWidth = 60;
  const nodeHeight = 150;
  const sliderWidth = 15;
  const sliderHeight = 100;
  const handleWidth = 20;
  const handleHeight = 6;
  const marginVertical = (nodeHeight - sliderHeight) / 2;
  const marginHorizontal = (nodeWidth - sliderWidth) / 2;
  const grayscale = data.grayscale ? data.grayscale : 50;
  const scale = d3.scaleLinear().domain([-1, 1]).range([0, 100]);
  const [height, setHeight] = useState(scale(nodeValue)); // Keep track of the current height
  const [isDragging, setIsDragging] = useState(false);
  const [selectedData, setSelectedData] = useState(data.selectedData || null);
  const [isGlowing, setIsGlowing] = useState(true);

  const draggable = data.draggable;

  // 1. Update the graph when data.value changes
  useEffect(() => {
    const svg = d3.select(svgRef.current);
    // 1. Transition the draggable handle to the new y position
    svg
      .select("rect.handle")
      .transition()
      // .duration(isDragging ? 0 : 200)
      .duration(0)
      .attr(
        "y",
        sliderHeight - scale(data.value) + marginVertical - handleHeight / 2
      );

    // 2. transition the progress bar to the new y position
    svg
      .select("rect.progress")
      .transition()
      // .duration(isDragging ? 0 : 200)
      .duration(0)
      .attr("y", sliderHeight - scale(data.value) + marginVertical)
      .attr("height", scale(data.value));

    // 3. transition the value text to the new y position
    //    and update the text to the new value
    svg
      .select("text.value")
      .transition()
      // .duration(isDragging ? 0 : 200)
      .duration(0)
      .attr("y", sliderHeight - scale(data.value) + marginVertical)
      .text(data.value.toFixed(1));
  }, [data.value]); // Depend only on data.value (passed from parent)

  // 2. Render the SVG graphic initially and define dragging functiona
  useEffect(() => {
    const svg = d3.select(svgRef.current);

    // Slider
    let rect = svg.select("rect.slider");
    if (rect.empty()) {
      rect = svg
        .append("rect")
        .attr("class", "slider")
        .attr("x", marginHorizontal)
        .attr("y", marginVertical) // Initial height
        .attr("width", sliderWidth)
        .attr("height", sliderHeight)
        .attr("stroke", "#aaa")
        .attr("fill", "none")
        .attr("rx", 2); // Rounded corners
    }

    // progress bar
    let progress = svg.select("rect.progress");
    if (progress.empty()) {
      progress = svg
        .append("rect")
        .attr("class", "progress")
        .attr("x", marginHorizontal)
        .attr("y", sliderHeight - height + marginVertical)
        .attr("width", sliderWidth)
        .attr("height", height)
        .attr("fill", "#EEEEEE");
    }

    // Draggable handle (dragged function defined below)
    let handle = svg.select("rect.handle");
    if (handle.empty()) {
      handle = svg
        .append("rect")
        .attr("class", "handle")
        .attr("x", marginHorizontal - (handleWidth - sliderWidth) / 2)
        .attr("y", sliderHeight - height + marginVertical - handleHeight / 2)
        .attr("width", handleWidth)
        .attr("height", handleHeight)
        .attr("fill", "#FF9100")
        .call(d3.drag().on("drag", dragged).on("end", dragEnded));
    }

    // Label of the node
    let text = svg.select("text");
    if (text.empty()) {
      text = svg
        .append("text")
        .attr("x", marginHorizontal + sliderWidth / 2)
        .attr("y", marginVertical / 2 + 5)
        .attr("text-anchor", "middle")
        .attr("font-size", "12px")
        .text(data.text);
    }

    // Value
    let valueText = svg.select("text.value");
    if (valueText.empty()) {
      valueText = svg
        .append("text")
        .attr("class", "value")
        .attr("x", marginHorizontal / 2)
        .attr("y", sliderHeight - height + marginVertical)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("font-size", "12px")
        .text(data.value.toFixed(1));
    }

    function dragged(event) {
      if (!draggable) return;
      setIsDragging(true);
      const newY = event.y;
      let newHeight = sliderHeight - newY + marginVertical - handleHeight / 2;
      // constrain the height to the range [0, sliderHeight]
      if (newHeight < 0) {
        newHeight = 0;
      } else if (newHeight > sliderHeight) {
        newHeight = sliderHeight;
      }

      // We don't need immediate effect, we just need to pass the value back to the parent
      const newValue = parseFloat(scale.invert(newHeight).toFixed(2));
      setNodeValue(newValue); // Update the node value
      // now, only works for the input nodes!
      const idx = id.split("input")[1] - 1; // get the index of the input node
      data.onValueChange(idx, newValue); // Update the value in parent
    }

    function dragEnded(event) {
      setIsDragging(false);
    }
  }, [height, data]); // Depend on height for initial rendering and dragging

  useEffect(() => {
    if (data.glowingEle === id) {
      setIsGlowing(true);
    } else {
      setIsGlowing(false);
    }
  }, [data.glowingEle]);

  return (
    <div
      className={tw`
        relative rounded-md transition-shadow`}
      style={
        isGlowing ? { boxShadow: "0 0 8px 4px rgba(255, 208, 0, 0.3)" } : {}
      }
    >
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
        className={tw`w-2 h-2 bg-blue-400`}
      />
      <div
        className={tw`w-[${nodeWidth}px] h-[${nodeHeight}px] p-0 m-0 bg-gray-${grayscale} border border-gray-200 rounded-md`}
      >
        <svg ref={svgRef} width="100%" height="100%" />
      </div>
      <Handle
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
        className={tw`w-2 h-2 bg-blue-400`}
      />
    </div>
  );
};

export default SliderNode;
