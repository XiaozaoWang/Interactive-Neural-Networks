import React, { useState, useEffect, useRef } from "react";
import { tw } from "twind";
import * as d3 from "d3";

const InputField = ({ data }) => {
  const svgRef = useRef(null);

  const nodeWidth = 200;
  const nodeHeight = 200;
  const margin = { top: 20, right: 10, bottom: 20, left: 20 };
  const width = nodeWidth - margin.left - margin.right; // graph width
  const height = nodeHeight - margin.top - margin.bottom;

  const [selectedData, setSelectedData] = useState(data.selectedData); // Track selected circle

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
    graph.append("g").call(yAxis);

    // Draw circles based on passed-in data array
    const combinedData = d3.zip(data.inputs, data.targets);

    graph
      .selectAll("circle")
      .data(combinedData)
      .join("circle")
      .attr("cx", (d) => xScale(d[0][0]))
      .attr("cy", (d) => yScale(d[0][1]))
      .attr("r", 5)
      .attr("fill", (d) => (d[1] == 1 ? "blue" : "red"))
      .attr("stroke", "none") // Default no stroke
      .on("click", function (event, d) {
        // Remove any previously added larger circles
        graph.selectAll(".selected").remove();

        // get the index of the selected data
        const index = combinedData.findIndex((item) => item === d);

        console.log("Selected data:", d);
        console.log("Selected index:", index);
        setSelectedData(index);

        // Call the onSelect callback to pass selected data to the parent
        if (data.onSelect) {
          data.onSelect(index);
        }

        // Add a new larger circle on top of the clicked circle
        graph
          .append("circle")
          .attr("class", "selected")
          .attr("cx", xScale(d[0][0]))
          .attr("cy", yScale(d[0][1]))
          .attr("r", 8) // Larger radius
          .attr("fill", "none")
          .attr("stroke", "black")
          .attr("stroke-width", 2);
      });
    graph
      .append("circle")
      .attr("class", "selected")
      .attr("cx", xScale(data.inputs[selectedData][0]))
      .attr("cy", yScale(data.inputs[selectedData][1]))
      .attr("r", 8) // Larger radius
      .attr("fill", "none")
      .attr("stroke", "black")
      .attr("stroke-width", 2);
  }, [data]);

  return (
    <div
      className={tw`w-[${nodeWidth}px] h-[${nodeHeight}px] p-0 m-0 bg-gray-100 border border-gray-300 rounded-md`}
    >
      <svg ref={svgRef} width="100%" height="100%" />
    </div>
  );
};

export default InputField;
