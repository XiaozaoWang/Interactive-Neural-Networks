import React, { useState, useEffect, useRef } from "react";
import { tw } from "twind";
import * as d3 from "d3";
import Samoyed from "../images/Samoyed.png";
import Samoyed_stroke from "../images/Samoyed_stroke.png";
import Shiba from "../images/Shiba.png";
import Shiba_stroke from "../images/Shiba_stroke.png";
import { FaQuestionCircle } from "react-icons/fa";
import { RiExchange2Fill } from "react-icons/ri";

const InputField = ({ data }) => {
  const svgRef = useRef(null);

  const nodeWidth = 220;
  const nodeHeight = 320;
  const margin = { top: 30, bottom: 130, left: 30, right: 20 };
  const width = nodeWidth - margin.left - margin.right; // graph width
  const height = width;
  const imgSize = 25;
  const labelX = "Size";
  const labelY = "Color";

  const [selectedData, setSelectedData] = useState(data.selectedData); // Track selected circle
  const [hoveredIndex, setHoveredIndex] = useState(null); // keep inside the component
  const [isExplanationVisible, setIsExplanationVisible] = useState(false); // State for explanation bubble
  const [isImageMode, setIsImageMode] = useState(true);

  const toggleExplanation = () => {
    setIsExplanationVisible((prev) => !prev); // Toggle explanation visibility
  };
  const toggleMode = () => setIsImageMode((prev) => !prev);

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

    // add axis labels
    graph
      .append("text")
      .attr("x", width)
      .attr("y", height + 30)
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .text(labelX);

    graph
      .append("text")
      .attr("x", 0)
      .attr("y", -10)
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      // .attr("transform", "rotate(-90)")
      .text(labelY);

    // draw a little square for each point in the prediction map
    if (data.mapPredictions && data.mapPredictions.length > 1) {
      // contains valid data
      for (let i = 0; i < data.mapUnits; i++) {
        for (let j = 0; j < data.mapUnits; j++) {
          const color =
            data.mapPredictions[i][j] > 0
              ? isImageMode
                ? "rgba(230,219,225, 0.5)"
                : "rgba(0,0,255, 0.3)"
              : isImageMode
              ? "rgba(237,166,62, 0.5)"
              : "rgba(255,0,0, 0.3)";
          graph
            .append("rect")
            .attr("x", xScale(-1 + (2 / data.mapUnits) * i))
            .attr("y", yScale(1 - (2 / data.mapUnits) * j))
            .attr("width", width / data.mapUnits)
            .attr("height", height / data.mapUnits)
            .attr("fill", color);
        }
      }
    }

    // Draw circles based on passed-in data array
    const combinedData = d3.zip(data.inputs, data.targets);

    const tooltip = d3
      .select("body")
      .append("div")
      .style("position", "absolute")
      .style("visibility", "hidden")
      .style("background", "white")
      .style("border", "1px solid black")
      .style("border-radius", "4px")
      .style("padding", "4px")
      .style("font-size", "12px")
      .style("pointer-events", "none");

    if (isImageMode) {
      graph // image data points
        .selectAll("image")
        .data(combinedData)
        .join("image")
        .attr("x", (d, i) =>
          i === hoveredIndex || i === selectedData
            ? xScale(d[0][0]) - (imgSize * 1.2) / 2
            : xScale(d[0][0]) - imgSize / 2
        )
        .attr("y", (d, i) =>
          i === hoveredIndex || i === selectedData
            ? yScale(d[0][1]) - (imgSize * 1.2) / 2
            : yScale(d[0][1]) - imgSize / 2
        )
        .attr("width", (d, i) =>
          i === hoveredIndex || i === selectedData ? imgSize * 1.2 : imgSize
        )
        .attr("height", (d, i) =>
          i === hoveredIndex || i === selectedData ? imgSize * 1.2 : imgSize
        )
        .attr("href", (d, i) =>
          selectedData === i
            ? d[1] === 1
              ? Samoyed_stroke
              : Shiba_stroke
            : d[1] === 1
            ? Samoyed
            : Shiba
        )
        .attr("cursor", "pointer")
        .on("mouseover", function (event, d) {
          setHoveredIndex(combinedData.findIndex((item) => item === d));
          tooltip
            .style("visibility", "visible")
            .text(
              `${d[1] === 1 ? "Samoyed" : "Shiba"} Size: ${d[0][0]} Color: ${
                d[0][1]
              }`
            )
            .style("left", `${event.pageX + 20}px`)
            .style("top", `${event.pageY - 10}px`);
        })
        .on("mousemove", function (event) {
          tooltip
            .style("left", `${event.pageX + 20}px`)
            .style("top", `${event.pageY - 10}px`);
        })
        .on("mouseout", function () {
          setHoveredIndex(null);
          tooltip.style("visibility", "hidden");
        })
        .on("click", function (event, d) {
          const index = combinedData.findIndex((item) => item === d);
          // Bring clicked image to the top
          d3.select(this).raise();
          setSelectedData(index);
          if (data.onSelect) {
            data.onSelect(index);
          }
        });
    } else {
      graph // circle data points
        .selectAll("circle")
        .data(combinedData)
        .join("circle")
        .attr("cx", (d) => xScale(d[0][0]))
        .attr("cy", (d) => yScale(d[0][1]))
        .attr("r", (d, i) => (i === hoveredIndex || i === selectedData ? 6 : 4))
        .attr("fill", (d) => (d[1] === 1 ? "blue" : "red"))
        .attr("stroke", "none")
        .attr("cursor", "pointer")
        .on("mouseover", function (event, d) {
          setHoveredIndex(combinedData.findIndex((item) => item === d));
          tooltip
            .style("visibility", "visible")
            .text(`Label: ${d[1]} Size: ${d[0][0]} Color: ${d[0][1]}`)
            .style("left", `${event.pageX + 20}px`)
            .style("top", `${event.pageY - 10}px`);
        })
        .on("mousemove", function (event) {
          tooltip
            .style("left", `${event.pageX + 20}px`)
            .style("top", `${event.pageY - 10}px`);
        })
        .on("mouseout", function () {
          setHoveredIndex(null);
          tooltip.style("visibility", "hidden");
        })
        .on("click", function (event, d) {
          const index = combinedData.findIndex((item) => item === d);
          // Bring clicked image to the top
          d3.select(this).raise();
          setSelectedData(index);
          if (data.onSelect) {
            data.onSelect(index);
          }
        });
      // Append selected circle with a larger radius
      graph
        .append("circle")
        .attr("class", "selected")
        .attr("cx", xScale(data.inputs[selectedData][0]))
        .attr("cy", yScale(data.inputs[selectedData][1]))
        .attr("r", 8) // Larger radius
        .attr("fill", "none")
        .attr("stroke", "black")
        .attr("stroke-width", 2);
    }

    // Add auxiliary lines
    graph // vertical line
      .append("line")
      .attr("x1", xScale(data.inputs[selectedData][0]))
      .attr("y1", yScale(data.inputs[selectedData][1]) + 10)
      .attr("x2", xScale(data.inputs[selectedData][0]))
      .attr("y2", height)
      .attr("stroke", "black")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "4");

    graph // horizontal line
      .append("line")
      .attr("x1", 0)
      .attr("y1", yScale(data.inputs[selectedData][1]))
      .attr("x2", xScale(data.inputs[selectedData][0]) - 10)
      .attr("y2", yScale(data.inputs[selectedData][1]))
      .attr("stroke", "black")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "4");

    return () => {
      tooltip.remove(); // Clean up tooltip on unmount
    };
  }, [data, selectedData, isImageMode, hoveredIndex]); // Add selectedData as a dependency to update text on selection change

  // Determine which image to display based on the target value
  const displayedImage =
    selectedData >= 0 && data.targets[selectedData] === 1 ? Samoyed : Shiba;

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
            {data.targets[selectedData] == 1 ? "Samoyed" : "Shiba"} (
            {data.targets[selectedData]})
          </p>
        </div>
      </div>
      <button
        onClick={toggleMode}
        className={tw`absolute top-[8px] right-[30px] text-gray-500 hover:text-gray-700`}
      >
        <RiExchange2Fill size={18} />
      </button>
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
