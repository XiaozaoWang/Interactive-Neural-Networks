import React, { useState, useEffect, useRef } from "react";
import { Handle, Position } from "@xyflow/react";
import { tw } from "twind";
import * as d3 from "d3";

const SliderNode = ({ id, data, isConnectable }) => {
  const svgRef = useRef(null);
  const [nodeValue, setNodeValue] = useState(data.value);
  const nodeWidth = 60;
  const nodeHeight = 150;
  const sliderWidth = 8;
  const sliderHeight = 100;
  const handleWidth = 20;
  const handleHeight = 10;
  const marginVertical = (nodeHeight - sliderHeight) / 2;
  const marginHorizontal = (nodeWidth - sliderWidth) / 2;
  const scale = d3.scaleLinear().domain([0, 1]).range([0, 100]);
  const [height, setHeight] = useState(scale(nodeValue)); // Keep track of the current height
  const [isDragging, setIsDragging] = useState(false);
  const [selectedData, setSelectedData] = useState(data.selectedData);

  // Do the following in every render
  // useEffect(() => {
  //   setSelectedData(data.selectedData);
  // }, [data.selectedData]);

  // Effect to update the height smoothly when data.value changes
  useEffect(() => {
    const svg = d3.select(svgRef.current);
    console.log("data.value:", data.value);
    // Transition the draggable handle to the new y position
    svg
      .select("rect.handle")
      .transition()
      .duration(isDragging ? 0 : 200)
      // .attr("y", nodeHeight - scale(data.value) - 5);
      .attr(
        "y",
        sliderHeight - scale(data.value) + marginVertical - handleHeight / 2
      );

    setHeight(scale(data.value)); // Update height after transition completes
  }, [data.value]); // Depend only on data.value (passed from parent)

  // Effect to render the SVG graphic initially and after dragging
  useEffect(() => {
    // console.log("heyyyyyyyyyyyyyyy");
    // console.log("data.selectedData0:", data.selectedData);

    const svg = d3.select(svgRef.current);

    // Create the rectangle if it doesn't exist yet
    let rect = svg.select("rect.slider");
    if (rect.empty()) {
      rect = svg
        .append("rect")
        .attr("class", "slider")
        .attr("x", marginHorizontal)
        .attr("y", marginVertical) // Initial height
        .attr("width", sliderWidth)
        .attr("height", sliderHeight)
        .attr("fill", "#ddd")
        .attr("rx", 2); // Rounded corners
    }

    // Create the draggable handle
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

    // add the text to the top of the slider
    let text = svg.select("text");
    if (text.empty()) {
      text = svg
        .append("text")
        .attr("x", marginHorizontal + sliderWidth / 2)
        .attr("y", marginVertical / 2)
        .attr("text-anchor", "middle")
        .attr("font-size", "12px")
        .text(data.text);
    }

    function dragged(event) {
      // console.log("data.selectedData1:", selectedData); // here's the problem!!! the drag function has some kind of closure that keeps the old value of data.selectedData
      setIsDragging(true);
      const newY = event.y;
      let newHeight = sliderHeight - newY + marginVertical - handleHeight / 2;
      // constrain the height to the range [0, sliderHeight]
      if (newHeight < 0) {
        newHeight = 0;
      } else if (newHeight > sliderHeight) {
        newHeight = sliderHeight;
      }
      console.log("newHeight:", newHeight.toFixed(0));

      setHeight(newHeight); // Update height in state for immediate effect
      const newValue = parseFloat(scale.invert(newHeight).toFixed(2));
      setNodeValue(newValue); // Update the node value
      console.log(`${id} changed to ${newValue}`);
      // now, only works for the input nodes!
      const idx = id.split("input")[1] - 1; // get the index of the input node
      // console.log("idx:", idx);
      // console.log("data.selectedData:", data.selectedData);
      data.onValueChange(idx, newValue); // Update the value in parent
    }

    function dragEnded(event) {
      setIsDragging(false);
    }
  }, [height, data]); // Depend on height for initial rendering and dragging

  return (
    <>
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
      />
      <div
        className={tw`w-[${nodeWidth}px] h-[${nodeHeight}px] p-0 m-0 bg-gray-50 border border-gray-100 rounded-md`}
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

export default SliderNode;
