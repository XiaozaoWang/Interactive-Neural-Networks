import React, { useState, useEffect, useRef } from "react";
import { Handle, Position } from "@xyflow/react";
import { tw } from "twind";
import * as d3 from "d3";

const GraphNode = ({ data }) => {
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
    const xScale = d3.scaleLinear().domain([-6, 6]).range([0, width]);
    const yScale = d3.scaleLinear().domain([0, 1]).range([height, 0]);

    // Create the x and y axes
    const xAxis = d3.axisBottom(xScale).ticks(5).tickSize(3);
    const yAxis = d3.axisLeft(yScale).ticks(5).tickSize(3).tickPadding(2);

    // Append the x axis to the SVG
    graph.append("g").attr("transform", `translate(0,${height})`).call(xAxis);

    // Append the y axis to the SVG
    // svg.append("g").call(yAxis);
    graph.append("g").call(yAxis);

    // Define the sigmoid function
    function sigmoid(x) {
      return 1 / (1 + Math.exp(-x));
    }

    // Generate data points for the sigmoid function
    const data = d3.range(-6, 6, 0.1).map(function (x) {
      return { x: x, y: sigmoid(x) };
    });

    const line = d3
      .line()
      .x((d) => xScale(d.x))
      .y((d) => yScale(d.y));

    graph
      .append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 2)
      .attr("d", line);

    const circle = graph
      .append("circle")
      .attr("cx", xScale(inVal))
      .attr("cy", yScale(sigmoid(inVal)))
      .attr("r", 5)
      .attr("fill", "red")

      .call(drag());

    function drag() {
      function dragstarted(event, d) {
        d3.select(this).attr("stroke", "black");
      }

      function dragged(event, d) {
        const xValue = xScale.invert(event.x);
        d3.select(this)
          .attr("cx", event.x)
          .attr("cy", yScale(sigmoid(xValue)));
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
      className={tw`w-[${nodeWidth}px] h-[${nodeHeight}px] p-0 m-0 bg-gray-100 border border-gray-300 rounded-md`}
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

export default GraphNode;
