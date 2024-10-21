import React, { useState, useEffect, useRef } from "react";
import { tw } from "twind";
import * as d3 from "d3";
import Samoyed from "../images/samoyed.jpg"; // Ensure you have the correct path
import Dachshund from "../images/dachshund.jpg"; // Ensure you have the correct path
import { FaQuestionCircle } from "react-icons/fa";

const InputField = ({ data }) => {
  const svgRef = useRef(null);

  const nodeWidth = 220;
  const nodeHeight = 320;
  const margin = { top: 20, bottom: 130, left: 30, right: 20 };
  const width = nodeWidth - margin.left - margin.right; // graph width
  const height = nodeHeight - margin.top - margin.bottom;

  const [selectedData, setSelectedData] = useState(data.selectedData); // Track selected circle

  const [isExplanationVisible, setIsExplanationVisible] = useState(false); // State for explanation bubble
  const toggleExplanation = () => {
    setIsExplanationVisible((prev) => !prev); // Toggle explanation visibility
  };

  useEffect(() => {
    const svg = d3.select(svgRef.current).attr("cursor", "pointer");
    svg.selectAll("*").remove();

    const graph = svg
      .attr("width", nodeWidth)
      .attr("height", nodeHeight)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Create scales for the x and y axes
    const xScale = d3.scaleLinear().domain([-1, 1]).range([0, width]);
    const yScale = d3.scaleLinear().domain([-1, 1]).range([height, 0]);

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
      .attr("fill", (d) => (d[1] === 1 ? "blue" : "red"))
      .attr("stroke", "none") // Default no stroke
      .on("click", function (event, d) {
        // console.log("I'm clicked");
        graph.selectAll(".selected").remove();

        // get the index of the selected data
        const index = combinedData.findIndex((item) => item === d);
        // console.log("Selected data:", d);
        // console.log("Selected index:", index);
        setSelectedData(index);

        // Call the onSelect callback to pass selected data to the parent
        if (data.onSelect) {
          data.onSelect(index);
        }
      });

    // Append selected circle and auxiliary lines
    graph
      .append("circle")
      .attr("class", "selected")
      .attr("cx", xScale(data.inputs[selectedData][0]))
      .attr("cy", yScale(data.inputs[selectedData][1]))
      .attr("r", 8) // Larger radius
      .attr("fill", "none")
      .attr("stroke", "black")
      .attr("stroke-width", 2);

    // Add x and y auxiliary lines
    graph
      .append("line")
      .attr("x1", xScale(data.inputs[selectedData][0]))
      .attr("y1", yScale(data.inputs[selectedData][1]))
      .attr("x2", xScale(data.inputs[selectedData][0]))
      .attr("y2", height)
      .attr("stroke", "black")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "4");

    graph
      .append("line")
      .attr("x1", 0)
      .attr("y1", yScale(data.inputs[selectedData][1]))
      .attr("x2", xScale(data.inputs[selectedData][0]))
      .attr("y2", yScale(data.inputs[selectedData][1]))
      .attr("stroke", "black")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "4");

    // Display the selected data values below the axes
    // const valueText = graph
    //   .append("g")
    //   .attr("transform", `translate(0, ${height + 20})`); // Adjust vertical positioning

    // // Display the X value
    // valueText
    //   .append("text")
    //   .attr("x", width / 2)
    //   .attr("text-anchor", "middle")
    //   .text(`X: ${data.inputs[selectedData][0]}`)
    //   .style("font-size", "12px")
    //   .style("fill", "black");

    // // Display the Y value
    // valueText
    //   .append("text")
    //   .attr("x", width / 2)
    //   .attr("y", 15) // Adjust y position for Y label
    //   .attr("text-anchor", "middle")
    //   .text(`Y: ${data.inputs[selectedData][1]}`)
    //   .style("font-size", "12px")
    //   .style("fill", "black");
  }, [data, selectedData]); // Add selectedData as a dependency to update text on selection change

  // Determine which image to display based on the target value
  const displayedImage =
    selectedData >= 0 && data.targets[selectedData] === 1 ? Samoyed : Dachshund;

  return (
    <div
      className={tw`w-[${nodeWidth}px] h-[${nodeHeight}px] p-0 m-0 bg-gray-100 border border-gray-300 rounded-md`}
    >
      <div className={tw`w-[${nodeWidth}px] h-[${height}px] mb-12`}>
        <svg ref={svgRef} width="100%" height="100%" />
      </div>

      <div className={tw`flex items-center  mx-4 my-8`}>
        <img
          src={displayedImage}
          alt="Selected Dog"
          className={tw`w-16 h-auto`}
        />
        <div className={tw`ml-4 text-gray-700 text-[14px]`}>
          <p>
            <strong>Size:</strong> {data.inputs[selectedData]?.[0]}
          </p>
          <p>
            <strong>Color:</strong> {data.inputs[selectedData]?.[1]}
          </p>
          <p>
            <strong>Label: </strong>
            {data.targets[selectedData] == 1 ? "Samoyed" : "Dachshund"} (
            {data.targets[selectedData]})
          </p>
        </div>
      </div>
      <button
        onClick={toggleExplanation}
        className={tw`absolute top-[8px] right-[8px] text-gray-500 hover:text-gray-700`}
      >
        <FaQuestionCircle size={18} />
      </button>
      {isExplanationVisible && (
        <div
          className={tw`absolute top-[20px] left-[${
            nodeWidth - 8
          }px]  w-48 bg-white border border-gray-300 rounded-md p-2 shadow-lg text-xs`} // Positioned top-right relative to the button
        >
          <p className={tw`py-[2px]`}>There are two types of dogs:</p>
          <ul>
            <li>
              <span className={tw`text-blue-500 font-bold`}>Blue</span> points
              represent Samoyed;
            </li>
            <li>
              <span className={tw`text-red-500 font-bold`}>Red</span> points
              represent Dachshund.
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default InputField;
