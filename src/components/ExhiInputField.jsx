// src/components/ExhiInputField.jsx
import React, { useState, useEffect, useRef } from "react";
import { tw } from "twind";
import * as d3 from "d3";
import { FaQuestionCircle } from "react-icons/fa";
import { RiExchange2Fill } from "react-icons/ri";

const ExhiInputField = ({ data }) => {
  const svgRef = useRef(null);
  const containerRef = useRef(null);

  const [selectedData, setSelectedData] = useState(data.selectedData);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [isExplanationVisible, setIsExplanationVisible] = useState(false);
  const [isImageMode, setIsImageMode] = useState(true);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const toggleExplanation = () => {
    setIsExplanationVisible((prev) => !prev);
  };

  const toggleMode = () => setIsImageMode((prev) => !prev);

  // Update dimensions on resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ width, height });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);

    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  useEffect(() => {
    if (dimensions.width === 0 || dimensions.height === 0) return;

    const svg = d3.select(svgRef.current).attr("cursor", "pointer");
    svg.selectAll("*").remove();

    // Calculate margins based on screen size
    const margin = {
      top: dimensions.height * 0.05,
      bottom: dimensions.height * 0.15,
      left: dimensions.width * 0.1,
      right: dimensions.width * 0.1,
    };

    const width = dimensions.width - margin.left - margin.right;
    const height = dimensions.height - margin.top - margin.bottom;

    // Adjust image size based on screen size
    const baseImgSize = Math.min(width, height) * 0.04;
    const imgSize = Math.max(20, baseImgSize); // Minimum size of 20px

    const graph = svg
      .attr("width", dimensions.width)
      .attr("height", dimensions.height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Create scales
    const xScale = d3.scaleLinear().domain([-1, 1]).range([0, width]);
    const yScale = d3.scaleLinear().domain([-1, 1]).range([height, 0]);

    // Create axes
    const xAxis = d3.axisBottom(xScale).ticks(5).tickSize(3);
    const yAxis = d3.axisLeft(yScale).ticks(5).tickSize(3).tickPadding(2);

    // Append axes
    graph.append("g").attr("transform", `translate(0,${height})`).call(xAxis);

    graph.append("g").call(yAxis);

    // Add axis labels with responsive font size
    const labelFontSize = Math.min(16, width * 0.02);

    graph
      .append("text")
      .attr("x", width / 2)
      .attr("y", height + margin.bottom * 0.7)
      .attr("text-anchor", "middle")
      .attr("font-size", `${labelFontSize}px`)
      .text("Size");

    graph
      .append("text")
      .attr("x", -margin.left * 0.7)
      .attr("y", height / 2)
      .attr("text-anchor", "middle")
      .attr("transform", "rotate(-90)")
      .attr("font-size", `${labelFontSize}px`)
      .text("Color");

    // Draw prediction map background if available
    if (data.mapPredictions && data.mapPredictions.length > 1) {
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

    const tooltip = d3
      .select("body")
      .append("div")
      .style("position", "absolute")
      .style("visibility", "hidden")
      .style("background", "white")
      .style("border", "1px solid black")
      .style("border-radius", "4px")
      .style("padding", "8px")
      .style("font-size", "14px")
      .style("pointer-events", "none")
      .style("z-index", "1000");

    if (isImageMode && data.dataPoints && data.dataPoints.length > 0) {
      // Image mode with actual images from data points
      graph
        .selectAll("image")
        .data(data.dataPoints)
        .join("image")
        .attr("x", (d, i) => {
          const scale = i === hoveredIndex || i === selectedData ? 1.2 : 1;
          return xScale(d.features[0]) - (imgSize * scale) / 2;
        })
        .attr("y", (d, i) => {
          const scale = i === hoveredIndex || i === selectedData ? 1.2 : 1;
          return yScale(d.features[1]) - (imgSize * scale) / 2;
        })
        .attr("width", (d, i) =>
          i === hoveredIndex || i === selectedData ? imgSize * 1.2 : imgSize
        )
        .attr("height", (d, i) =>
          i === hoveredIndex || i === selectedData ? imgSize * 1.2 : imgSize
        )
        .attr("href", (d) => d.imgaddr)
        .attr("cursor", "pointer")
        .on("mouseover", function (event, d) {
          const index = data.dataPoints.findIndex((item) => item === d);
          setHoveredIndex(index);
          tooltip
            .style("visibility", "visible")
            .html(
              `
              <strong>${d.name}</strong><br/>
              Class: ${d.class}<br/>
              Size: ${d.features[0].toFixed(2)}<br/>
              Color: ${d.features[1].toFixed(2)}<br/>
              UID: ${d.uid}
            `
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
          const index = data.dataPoints.findIndex((item) => item === d);
          d3.select(this).raise();
          setSelectedData(index);
          if (data.onSelect) {
            data.onSelect(index);
          }
        });
    } else {
      // Circle mode as fallback
      graph
        .selectAll("circle")
        .data(data.dataPoints || [])
        .join("circle")
        .attr("cx", (d) => xScale(d.features[0]))
        .attr("cy", (d) => yScale(d.features[1]))
        .attr("r", (d, i) => (i === hoveredIndex || i === selectedData ? 8 : 6))
        .attr("fill", (d) => (d.class === "kiki" ? "blue" : "red"))
        .attr("stroke", "none")
        .attr("cursor", "pointer")
        .on("mouseover", function (event, d) {
          const index = data.dataPoints.findIndex((item) => item === d);
          setHoveredIndex(index);
          tooltip
            .style("visibility", "visible")
            .html(
              `
              <strong>${d.name}</strong><br/>
              Class: ${d.class}<br/>
              Size: ${d.features[0].toFixed(2)}<br/>
              Color: ${d.features[1].toFixed(2)}<br/>
              UID: ${d.uid}
            `
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
          const index = data.dataPoints.findIndex((item) => item === d);
          d3.select(this).raise();
          setSelectedData(index);
          if (data.onSelect) {
            data.onSelect(index);
          }
        });
    }

    // Add auxiliary lines for selected point
    if (
      selectedData !== null &&
      data.dataPoints &&
      data.dataPoints[selectedData]
    ) {
      const selectedPoint = data.dataPoints[selectedData];
      graph
        .append("line")
        .attr("x1", xScale(selectedPoint.features[0]))
        .attr("y1", yScale(selectedPoint.features[1]) + 10)
        .attr("x2", xScale(selectedPoint.features[0]))
        .attr("y2", height)
        .attr("stroke", "black")
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "4");

      graph
        .append("line")
        .attr("x1", 0)
        .attr("y1", yScale(selectedPoint.features[1]))
        .attr("x2", xScale(selectedPoint.features[0]) - 10)
        .attr("y2", yScale(selectedPoint.features[1]))
        .attr("stroke", "black")
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "4");
    }

    return () => {
      tooltip.remove();
    };
  }, [data, selectedData, isImageMode, hoveredIndex, dimensions]);

  const selectedPoint =
    selectedData !== null && data.dataPoints
      ? data.dataPoints[selectedData]
      : null;

  return (
    <div
      ref={containerRef}
      className={tw`w-full h-full bg-transparent relative`}
    >
      <svg
        ref={svgRef}
        className={tw`w-full h-full`}
        style={{ background: "transparent" }}
      />

      {/* Selected Data Info Panel */}
      {selectedPoint && (
        <div
          className={tw`absolute bottom-4 left-4 bg-white p-4 rounded-lg shadow-lg max-w-sm`}
        >
          <h3 className={tw`font-bold text-lg mb-2`}>{selectedPoint.name}</h3>
          <div className={tw`text-sm text-gray-700`}>
            <p>
              <strong>Class:</strong> {selectedPoint.class}
            </p>
            <p>
              <strong>Size:</strong> {selectedPoint.features[0].toFixed(2)}
            </p>
            <p>
              <strong>Color:</strong> {selectedPoint.features[1].toFixed(2)}
            </p>
            <p>
              <strong>UID:</strong> {selectedPoint.uid}
            </p>
          </div>
          {selectedPoint.imgaddr && (
            <img
              src={selectedPoint.imgaddr}
              alt={selectedPoint.name}
              className={tw`mt-2 max-w-full h-auto max-h-32 object-contain`}
            />
          )}
        </div>
      )}

      {/* Control Buttons */}
      <button
        onClick={toggleMode}
        className={tw`absolute top-4 right-12 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow`}
        title="Toggle view mode"
      >
        <RiExchange2Fill size={20} className={tw`text-gray-600`} />
      </button>

      <button
        onClick={toggleExplanation}
        className={tw`absolute top-4 right-4 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow`}
        title="Show explanation"
      >
        <FaQuestionCircle size={20} className={tw`text-gray-600`} />
      </button>

      {isExplanationVisible && (
        <div
          className={tw`absolute top-16 right-4 w-64 bg-white border border-gray-300 rounded-lg p-4 shadow-lg text-sm`}
        >
          <h4 className={tw`font-bold mb-2`}>About this visualization:</h4>
          <p className={tw`mb-2`}>There are two types of objects:</p>
          <ul className={tw`list-disc list-inside space-y-1`}>
            <li>
              <span className={tw`text-blue-500 font-bold`}>Blue/Kiki</span>{" "}
              objects
            </li>
            <li>
              <span className={tw`text-red-500 font-bold`}>Red/Bouba</span>{" "}
              objects
            </li>
          </ul>
          <p className={tw`mt-2 text-xs text-gray-600`}>
            Add objects using the control panel on the top-left.
          </p>
        </div>
      )}
    </div>
  );
};

export default ExhiInputField;
