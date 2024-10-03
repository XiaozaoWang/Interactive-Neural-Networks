import React, { useState, useEffect, useRef } from "react";
import { Handle, Position } from "@xyflow/react";
import { tw } from "twind";
import * as d3 from "d3";

const Transparent = ({ data }) => {
  const svgRef = useRef(null);

  const nodeWidth = 200;
  const nodeHeight = 200;
  const margin = { top: 20, right: 10, bottom: 20, left: 20 };
  const width = nodeWidth - margin.left - margin.right; // graph width
  const height = nodeHeight - margin.top - margin.bottom;

  const inVal = 0;
  const [outVal, setOutVal] = useState(0);

  useEffect(() => {
    const svg = d3.select(svgRef.current).attr("cursor", "pointer");
    svg.selectAll("*").remove();

    const graph = svg
      .attr("width", nodeWidth)
      .attr("height", nodeHeight)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Create scales for the x and y axes
    const xScale = d3.scaleLinear().domain([0, 1]).range([0, width]);
    const yScale = d3.scaleLinear().domain([0, 1]).range([height, 0]);

    // Create the x and y axes
    const xAxis = d3.axisBottom(xScale).ticks(5).tickSize(3);
    const yAxis = d3.axisLeft(yScale).ticks(5).tickSize(3).tickPadding(2);

    // Append the x axis to the SVG
    graph.append("g").attr("transform", `translate(0,${height})`).call(xAxis);

    // Append the y axis to the SVG
    // svg.append("g").call(yAxis);
    graph.append("g").call(yAxis);

    const circle = graph
      .append("circle")
      .attr("cx", 10)
      .attr("cy", 10)
      .attr("r", 5)
      .attr("fill", "red")
      .on("click", function (event) {
        const [x, y] = d3.pointer(event);
        graph
          .append("circle")
          .attr("cx", x)
          .attr("cy", y)
          .attr("r", 10)
          .attr("fill", "black");
      });
  }, []);
  return (
    <div
      className={tw`w-[${nodeWidth}px] h-[${nodeHeight}px] p-0 m-0 bg-gray-100 border border-gray-300 rounded-md`}
    >
      <svg ref={svgRef} width="100%" height="100%" />
    </div>
  );
};

export default Transparent;
