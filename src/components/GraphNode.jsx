import React, { useState, useEffect, useRef } from "react";
import { Handle, Position } from "@xyflow/react";
import { tw } from "twind";
import * as d3 from "d3";

const GraphNode = ({ id, data }) => {
  const svgRef = useRef(null);

  const nodeWidth = 150;
  const nodeHeight = 150;
  const margin = { top: 10, bottom: 10, left: 10, right: 10 };
  const width = nodeWidth - margin.left - margin.right; // graph width
  const height = nodeHeight - margin.top - margin.bottom;
  // Create scales for the x and y axes
  const xScale = d3.scaleLinear().domain([-3, 3]).range([0, width]);
  const yScale = d3.scaleLinear().domain([-1, 1]).range([height, 0]);

  const input = data.input;
  const [output, setOutput] = useState(data.output);
  const [isDragging, setIsDragging] = useState(false);
  const draggable = data.draggable ? data.draggable : false;
  const [isGlowing, setIsGlowing] = useState(true);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    // transition the progress bar to the new y position
    svg
      .select("circle")
      .transition()
      // .duration(isDragging ? 0 : 200)
      .duration(0) // !!!!! Naruhodo!!!!
      .attr("cx", xScale(data.input))
      .attr("cy", yScale(data.func(data.input)));

    // update data.output
    setOutput(data.func(data.input));
  }, [data.input]); // Depend only on data.input (passed from parent)

  // set glowing
  useEffect(() => {
    if (data.glowingEle === id) {
      setIsGlowing(true);
    } else {
      setIsGlowing(false);
    }
  }, [data.glowingEle]);

  useEffect(() => {
    const svg = d3.select(svgRef.current).attr("cursor", "pointer");
    svg.selectAll("*").remove();

    const graph = svg
      .attr("width", nodeWidth)
      .attr("height", nodeHeight)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    // .attr("cursor", "ns-resize");

    // Create the x and y axes
    const xAxis = d3.axisBottom(xScale).ticks(5).tickSize(3);
    const yAxis = d3.axisLeft(yScale).ticks(2).tickSize(3).tickPadding(2);
    // don't display the 0 tick
    yAxis.tickValues([-1, 1]);

    // Append the x axis to the SVG
    graph
      .append("g")
      .attr("transform", `translate(0,${height / 2})`)
      .call(xAxis);

    // Append the y axis to the SVG
    graph
      .append("g")
      .attr("transform", `translate(${width / 2},0)`)
      .call(yAxis);

    // Generate data points for the activation function
    const dataPoints = d3.range(-6, 6, 0.1).map(function (x) {
      return { x: x, y: data.func(x) };
    });

    const line = d3
      .line()
      .x((d) => xScale(d.x))
      .y((d) => yScale(d.y));

    // Draw the activation graph
    graph
      .append("path")
      .datum(dataPoints)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 2)
      .attr("d", line);

    // Create a draggable circle on the activation curve
    const circle = graph
      .append("circle")
      .attr("cx", xScale(input))
      .attr("cy", yScale(data.func(input)))
      .attr("r", 5)
      .attr("fill", "red")
      .call(drag());

    function drag() {
      function dragstarted(event, d) {
        d3.select(this).attr("stroke", "black");
      }

      function dragged(event, d) {
        if (!draggable) return;
        const xValue = xScale.invert(event.x);
        d3.select(this)
          .attr("cx", event.x)
          .attr("cy", yScale(data.func(xValue)));
      }

      function dragended(event, d) {
        d3.select(this).attr("stroke", null);
      }

      return d3
        .drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
    }
  }, []);

  return (
    <div
      className={tw`w-[${nodeWidth}px] h-[${nodeHeight}px] p-0 m-0 bg-gray-100 border border-gray-300 rounded-md transition-shadow`}
      style={
        isGlowing ? { boxShadow: "0 0 8px 4px rgba(255, 208, 0, 0.3)" } : {}
      }
    >
      <Handle
        type="target"
        position="left"
        className={tw`w-2 h-2 bg-blue-400`}
      />
      <svg ref={svgRef} width="100%" height="100%" />
      <Handle
        type="source"
        position="right"
        className={tw`w-2 h-2 bg-blue-400`}
      />
    </div>
  );
};

export default GraphNode;
