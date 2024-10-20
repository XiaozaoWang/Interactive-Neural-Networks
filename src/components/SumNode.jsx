import React, { useState, useEffect, useRef } from "react";
import { Handle, Position } from "@xyflow/react";
import { tw } from "twind";
import * as d3 from "d3";
import { TbSum } from "react-icons/tb";

const SumNode = ({ id, data, isConnectable }) => {
  const svgRef = useRef(null);
  const [sum, setSum] = useState(data.sum);
  const [weights, setWeights] = useState(data.weights);
  const [bias, setBias] = useState(data.bias);

  const nodeWidth = 30;
  const nodeHeight = 130;
  const scale = d3.scaleLinear().domain([-3, 3]).range([0, nodeHeight]);
  const [height, setHeight] = useState(scale(sum)); // Keep track of the current height
  //   const [biasHeight, setBiasHeight] = useState(scale(bias)); // Keep track of the current height
  const [isDragging, setIsDragging] = useState(false);
  const draggable = data.draggable ? data.draggable : false;

  // Update the graph when data.value changes
  useEffect(() => {
    const svg = d3.select(svgRef.current);
    // transition the progress bar to the new y position

    console.log("data.sum: ", data.sum);
    svg
      .select("rect.progress")
      .transition()
      .duration(isDragging ? 0 : 200)
      .attr("y", nodeHeight - scale(data.sum))
      .attr("height", scale(data.sum));
  }, [data.sum]); // Depend only on data.sum (passed from parent)

  // Render the SVG graphic initially and define dragging functiona
  useEffect(() => {
    const svg = d3.select(svgRef.current);

    //
    "data: ", data;
    // progress bar
    let progress = svg.select("rect.progress");
    if (progress.empty()) {
      progress = svg
        .append("rect")
        .attr("class", "progress")
        .attr("x", 0)
        .attr("y", nodeHeight - height)
        .attr("width", nodeWidth)
        .attr("height", height)
        .attr("fill", "#FCEA8F");
    }

    function dragged(event) {
      if (!draggable) return;
      setIsDragging(true);
      const newY = event.y;
      let newBiasHeight = nodeHeight - newY;
      // constrain the height to the range [0, sliderHeight]
      if (newBiasHeight < 0) {
        newBiasHeight = 0;
      } else if (newBiasHeight > nodeHeight) {
        newBiasHeight = sliderHeight;
      }

      // We don't need immediate effect, we just need to pass the value back to the parent
      const newBiasValue = parseFloat(scale.invert(newBiasHeight).toFixed(2));
      //   setNodeValue(newValue); // Update the node value

      data.onBiasChange(newBiasValue); // Update the value in parent
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
        className={tw`w-2 h-2 bg-blue-400`}
      />
      <div
        className={tw`w-[${nodeWidth}px] h-[${nodeHeight}px] p-0 m-0 bg-gray-50 border border-gray-300 rounded-md`}
      >
        <svg ref={svgRef} width="100%" height="100%" />
        <div className={tw`absolute inset-0 flex justify-center items-center`}>
          <TbSum className={tw`text-gray-700 text-3xl`} />
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
        className={tw`w-2 h-2 bg-blue-400`}
      />
    </>
  );
};

export default SumNode;
