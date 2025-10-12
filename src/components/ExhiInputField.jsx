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

  // Update selectedData when data.selectedData changes (when new points are added)
  useEffect(() => {
    setSelectedData(data.selectedData);
  }, [data.selectedData]);

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

    // Calculate margins and make the plot area a perfect square
    const baseMargin = Math.min(dimensions.width, dimensions.height) * 0.15;
    const margin = {
      top: baseMargin * 0.5,
      bottom: baseMargin,
      left: baseMargin,
      right: baseMargin * 0.5,
    };

    // Make the plot area a perfect square
    const plotSize = Math.min(
      dimensions.width - margin.left - margin.right,
      dimensions.height - margin.top - margin.bottom
    );
    const width = plotSize;
    const height = plotSize;

    // Adjust image size based on screen size
    const baseImgSize = Math.min(width, height) * 0.08;
    const imgSize = Math.max(20, baseImgSize); // Minimum size of 20px

    const graph = svg
      .attr("width", dimensions.width)
      .attr("height", dimensions.height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Create scales
    const xScale = d3.scaleLinear().domain([-1, 1]).range([0, width]);
    const yScale = d3.scaleLinear().domain([-1, 1]).range([height, 0]);

    // Add a subtle background for the data field
    graph
      .append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "#f8fafc")
      .attr("rx", 4)
      .attr("ry", 4);

    // Create axes with reduced tick size to prevent overlap
    const xAxis = d3.axisBottom(xScale).ticks(5).tickSize(6).tickPadding(8);
    const yAxis = d3.axisLeft(yScale).ticks(5).tickSize(6).tickPadding(8);

    // Append axes
    graph.append("g").attr("transform", `translate(0,${height})`).call(xAxis);
    graph.append("g").call(yAxis);

    // Increase font size for axis labels and ticks
    const labelFontSize = Math.min(18, plotSize * 0.04);
    const tickFontSize = Math.min(14, plotSize * 0.03);

    // Style axes with larger font
    graph
      .selectAll(".tick text")
      .style("font-size", `${tickFontSize}px`)
      .style("font-weight", "500");

    // Add axis labels with larger font size - SWAPPED AXIS LABELS
    graph
      .append("text")
      .attr("x", width / 2)
      .attr("y", height + margin.bottom * 0.7)
      .attr("text-anchor", "middle")
      .attr("font-size", `${labelFontSize}px`)
      .attr("font-weight", "bold")
      .style("fill", "#374151")
      .text("Color"); // X-axis is now Color

    graph
      .append("text")
      .attr("x", -margin.left * 0.7)
      .attr("y", -margin.top * 0.7)
      .attr("text-anchor", "middle")
      .attr("transform", "rotate(-90)")
      .attr("font-size", `${labelFontSize}px`)
      .attr("font-weight", "bold")
      .style("fill", "#374151")
      .text("Size"); // Y-axis is now Size

    // Add gradient color strip below X-axis (Color axis)
    const gradientId = "color-gradient";
    const defs = svg.append("defs");
    const gradient = defs
      .append("linearGradient")
      .attr("id", gradientId)
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "100%")
      .attr("y2", "0%");

    gradient.append("stop").attr("offset", "0%").attr("stop-color", "#E1504C");
    gradient.append("stop").attr("offset", "50%").attr("stop-color", "#9C4CE1");
    gradient
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#4CC9E1");

    graph
      .append("rect")
      .attr("x", 0)
      .attr("y", height + margin.bottom * 0.35)
      .attr("width", width)
      .attr("height", 10)
      .attr("fill", `url(#${gradientId})`)
      .attr("rx", 5)
      .attr("ry", 5);

    // Add size circles to the left of Y-axis (Size axis) with better spacing
    const sizeCircles = [-1, -0.5, 0, 0.5, 1];
    const maxCircleSize = Math.min(18, plotSize * 0.025);
    const minCircleSize = Math.min(4, plotSize * 0.01);

    sizeCircles.forEach((value) => {
      const circleSize = d3
        .scaleLinear()
        .domain([-1, 1])
        .range([minCircleSize, maxCircleSize])(value);

      graph
        .append("circle")
        .attr("cx", -margin.left * 0.5)
        .attr("cy", yScale(value))
        .attr("r", circleSize)
        .attr("fill", "none")
        .attr("stroke", "#6B7280")
        .attr("stroke-width", 1.5);
    });

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
      .style("border", "1px solid #D1D5DB")
      .style("border-radius", "6px")
      .style("padding", "8px")
      .style("font-size", "12px")
      .style(
        "box-shadow",
        "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
      )
      .style("pointer-events", "none")
      .style("z-index", "1000")
      .style("max-width", "140px");

    // Create a persistent tooltip group for the selected point
    const persistentTooltipGroup = graph
      .append("g")
      .attr("class", "persistent-tooltip")
      .style("display", selectedData !== null ? "block" : "none");

    if (isImageMode && data.dataPoints && data.dataPoints.length > 0) {
      // Image mode with actual images from data points
      const images = graph
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
              <div style="font-weight: 600; color: #1F2937; font-size: 11px;">${
                d.name
              }</div>
              <div style="font-size: 10px; color: #6B7280; margin-top: 2px;">
                <div><strong>Class:</strong> ${d.class}</div>
                <div><strong>Color:</strong> ${d.features[0].toFixed(2)}</div>
                <div><strong>Size:</strong> ${d.features[1].toFixed(2)}</div>
              </div>
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
          // Don't hide tooltip if it's for the selected point
          if (!data.dataPoints.find((d, i) => i === selectedData)) {
            tooltip.style("visibility", "hidden");
          }
        })
        .on("click", function (event, d) {
          const index = data.dataPoints.findIndex((item) => item === d);
          d3.select(this).raise();
          setSelectedData(index);
          if (data.onSelect) {
            data.onSelect(index);
          }
        });

      // Update persistent tooltip for selected point
      if (selectedData !== null && data.dataPoints[selectedData]) {
        const selectedPoint = data.dataPoints[selectedData];
        const xPos = xScale(selectedPoint.features[0]);
        const yPos = yScale(selectedPoint.features[1]);

        // Clear previous persistent tooltip
        persistentTooltipGroup.selectAll("*").remove();

        // Add background for tooltip with smaller size
        const tooltipWidth = 120;
        const tooltipHeight = 45;
        const tooltipBg = persistentTooltipGroup
          .append("rect")
          .attr("x", xPos - tooltipWidth / 2)
          .attr("y", yPos - tooltipHeight - 15)
          .attr("width", tooltipWidth)
          .attr("height", tooltipHeight)
          .attr("fill", "white")
          .attr("stroke", "#3B82F6")
          .attr("stroke-width", 1.5)
          .attr("rx", 6)
          .attr("ry", 6)
          .style("filter", "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))");

        // Add tooltip text with smaller font sizes
        persistentTooltipGroup
          .append("text")
          .attr("x", xPos)
          .attr("y", yPos - tooltipHeight - 15 + 18)
          .attr("text-anchor", "middle")
          .attr("font-size", "10px")
          .attr("fill", "#6B7280")
          .text(`Color: ${selectedPoint.features[0].toFixed(2)}`);

        persistentTooltipGroup
          .append("text")
          .attr("x", xPos)
          .attr("y", yPos - tooltipHeight - 15 + 32)
          .attr("text-anchor", "middle")
          .attr("font-size", "10px")
          .attr("fill", "#6B7280")
          .text(`Size: ${selectedPoint.features[1].toFixed(2)}`);
      }
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
              <div style="font-weight: 600; color: #1F2937; font-size: 11px;">${
                d.name
              }</div>
              <div style="font-size: 10px; color: #6B7280; margin-top: 2px;">
                <div><strong>Class:</strong> ${d.class}</div>
                <div><strong>Color:</strong> ${d.features[0].toFixed(2)}</div>
                <div><strong>Size:</strong> ${d.features[1].toFixed(2)}</div>
              </div>
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
          if (!data.dataPoints.find((d, i) => i === selectedData)) {
            tooltip.style("visibility", "hidden");
          }
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

      // X-axis auxiliary line (Color)
      graph
        .append("line")
        .attr("x1", xScale(selectedPoint.features[0]))
        .attr("y1", yScale(selectedPoint.features[1]))
        .attr("x2", xScale(selectedPoint.features[0]))
        .attr("y2", height)
        .attr("stroke", "#3B82F6")
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "4,4");

      // Y-axis auxiliary line (Size)
      graph
        .append("line")
        .attr("x1", xScale(selectedPoint.features[0]))
        .attr("y1", yScale(selectedPoint.features[1]))
        .attr("x2", 0)
        .attr("y2", yScale(selectedPoint.features[1]))
        .attr("stroke", "#3B82F6")
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "4,4");

      // Add coordinate labels at the axes with better positioning
      graph
        .append("text")
        .attr("x", xScale(selectedPoint.features[0]))
        .attr("y", height + margin.bottom * 0.6)
        .attr("text-anchor", "middle")
        .attr("font-size", "12px")
        .attr("font-weight", "bold")
        .attr("fill", "#3B82F6")
        .text(selectedPoint.features[0].toFixed(2));

      graph
        .append("text")
        .attr("x", -margin.left * 0.7)
        .attr("y", yScale(selectedPoint.features[1]))
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("font-size", "12px")
        .attr("font-weight", "bold")
        .attr("fill", "#3B82F6")
        .text(selectedPoint.features[1].toFixed(2));
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
    </div>
  );
};

export default ExhiInputField;

// =================================================================================================================

// // src/components/ExhiInputField.jsx
// import React, { useState, useEffect, useRef } from "react";
// import { tw } from "twind";
// import * as d3 from "d3";
// import { FaQuestionCircle } from "react-icons/fa";
// import { RiExchange2Fill } from "react-icons/ri";

// const ExhiInputField = ({ data }) => {
//   const svgRef = useRef(null);
//   const containerRef = useRef(null);

//   const [selectedData, setSelectedData] = useState(data.selectedData);
//   const [hoveredIndex, setHoveredIndex] = useState(null);
//   const [isExplanationVisible, setIsExplanationVisible] = useState(false);
//   const [isImageMode, setIsImageMode] = useState(true);
//   const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

//   const toggleExplanation = () => {
//     setIsExplanationVisible((prev) => !prev);
//   };

//   const toggleMode = () => setIsImageMode((prev) => !prev);

//   // Update dimensions on resize
//   useEffect(() => {
//     const updateDimensions = () => {
//       if (containerRef.current) {
//         const { width, height } = containerRef.current.getBoundingClientRect();
//         setDimensions({ width, height });
//       }
//     };

//     updateDimensions();
//     window.addEventListener("resize", updateDimensions);

//     return () => window.removeEventListener("resize", updateDimensions);
//   }, []);

//   useEffect(() => {
//     if (dimensions.width === 0 || dimensions.height === 0) return;

//     const svg = d3.select(svgRef.current).attr("cursor", "pointer");
//     svg.selectAll("*").remove();

//     // Calculate margins based on screen size
//     const margin = {
//       top: dimensions.height * 0.05,
//       bottom: dimensions.height * 0.15,
//       left: dimensions.width * 0.1,
//       right: dimensions.width * 0.1,
//     };

//     const width = dimensions.width - margin.left - margin.right;
//     const height = dimensions.height - margin.top - margin.bottom;

//     // Adjust image size based on screen size
//     const baseImgSize = Math.min(width, height) * 0.08;
//     const imgSize = Math.max(20, baseImgSize); // Minimum size of 20px

//     const graph = svg
//       .attr("width", dimensions.width)
//       .attr("height", dimensions.height)
//       .append("g")
//       .attr("transform", `translate(${margin.left},${margin.top})`);

//     // Create scales
//     const xScale = d3.scaleLinear().domain([-1, 1]).range([0, width]);
//     const yScale = d3.scaleLinear().domain([-1, 1]).range([height, 0]);

//     // Create axes
//     const xAxis = d3.axisBottom(xScale).ticks(5).tickSize(3);
//     const yAxis = d3.axisLeft(yScale).ticks(5).tickSize(3).tickPadding(2);

//     // Append axes
//     graph.append("g").attr("transform", `translate(0,${height})`).call(xAxis);

//     graph.append("g").call(yAxis);

//     // Add axis labels with responsive font size
//     const labelFontSize = Math.min(16, width * 0.02);

//     graph
//       .append("text")
//       .attr("x", width / 2)
//       .attr("y", height + margin.bottom * 0.7)
//       .attr("text-anchor", "middle")
//       .attr("font-size", `${labelFontSize}px`)
//       .text("Size");

//     graph
//       .append("text")
//       .attr("x", -margin.left * 0.7)
//       .attr("y", height / 2)
//       .attr("text-anchor", "middle")
//       .attr("transform", "rotate(-90)")
//       .attr("font-size", `${labelFontSize}px`)
//       .text("Color");

//     // Draw prediction map background if available
//     if (data.mapPredictions && data.mapPredictions.length > 1) {
//       for (let i = 0; i < data.mapUnits; i++) {
//         for (let j = 0; j < data.mapUnits; j++) {
//           const color =
//             data.mapPredictions[i][j] > 0
//               ? isImageMode
//                 ? "rgba(230,219,225, 0.5)"
//                 : "rgba(0,0,255, 0.3)"
//               : isImageMode
//               ? "rgba(237,166,62, 0.5)"
//               : "rgba(255,0,0, 0.3)";

//           graph
//             .append("rect")
//             .attr("x", xScale(-1 + (2 / data.mapUnits) * i))
//             .attr("y", yScale(1 - (2 / data.mapUnits) * j))
//             .attr("width", width / data.mapUnits)
//             .attr("height", height / data.mapUnits)
//             .attr("fill", color);
//         }
//       }
//     }

//     const tooltip = d3
//       .select("body")
//       .append("div")
//       .style("position", "absolute")
//       .style("visibility", "hidden")
//       .style("background", "white")
//       .style("border", "1px solid black")
//       .style("border-radius", "4px")
//       .style("padding", "8px")
//       .style("font-size", "14px")
//       .style("pointer-events", "none")
//       .style("z-index", "1000");

//     if (isImageMode && data.dataPoints && data.dataPoints.length > 0) {
//       // Image mode with actual images from data points
//       graph
//         .selectAll("image")
//         .data(data.dataPoints)
//         .join("image")
//         .attr("x", (d, i) => {
//           const scale = i === hoveredIndex || i === selectedData ? 1.2 : 1;
//           return xScale(d.features[0]) - (imgSize * scale) / 2;
//         })
//         .attr("y", (d, i) => {
//           const scale = i === hoveredIndex || i === selectedData ? 1.2 : 1;
//           return yScale(d.features[1]) - (imgSize * scale) / 2;
//         })
//         .attr("width", (d, i) =>
//           i === hoveredIndex || i === selectedData ? imgSize * 1.2 : imgSize
//         )
//         .attr("height", (d, i) =>
//           i === hoveredIndex || i === selectedData ? imgSize * 1.2 : imgSize
//         )
//         .attr("href", (d) => d.imgaddr)
//         .attr("cursor", "pointer")
//         .on("mouseover", function (event, d) {
//           const index = data.dataPoints.findIndex((item) => item === d);
//           setHoveredIndex(index);
//           tooltip
//             .style("visibility", "hidden")
//             .html(
//               `
//               <strong>${d.name}</strong><br/>
//               Class: ${d.class}<br/>
//               Size: ${d.features[0].toFixed(2)}<br/>
//               Color: ${d.features[1].toFixed(2)}<br/>
//               UID: ${d.uid}
//             `
//             )
//             .style("left", `${event.pageX + 20}px`)
//             .style("top", `${event.pageY - 10}px`);
//         })
//         .on("mousemove", function (event) {
//           tooltip
//             .style("left", `${event.pageX + 20}px`)
//             .style("top", `${event.pageY - 10}px`);
//         })
//         .on("mouseout", function () {
//           setHoveredIndex(null);
//           tooltip.style("visibility", "hidden");
//         })
//         .on("click", function (event, d) {
//           const index = data.dataPoints.findIndex((item) => item === d);
//           d3.select(this).raise();
//           setSelectedData(index);
//           if (data.onSelect) {
//             data.onSelect(index);
//           }
//         });
//     } else {
//       // Circle mode as fallback
//       graph
//         .selectAll("circle")
//         .data(data.dataPoints || [])
//         .join("circle")
//         .attr("cx", (d) => xScale(d.features[0]))
//         .attr("cy", (d) => yScale(d.features[1]))
//         .attr("r", (d, i) => (i === hoveredIndex || i === selectedData ? 8 : 6))
//         .attr("fill", (d) => (d.class === "kiki" ? "blue" : "red"))
//         .attr("stroke", "none")
//         .attr("cursor", "pointer")
//         .on("mouseover", function (event, d) {
//           const index = data.dataPoints.findIndex((item) => item === d);
//           setHoveredIndex(index);
//           tooltip
//             .style("visibility", "hidden")
//             .html(
//               `
//               <strong>${d.name}</strong><br/>
//               Class: ${d.class}<br/>
//               Size: ${d.features[0].toFixed(2)}<br/>
//               Color: ${d.features[1].toFixed(2)}<br/>
//               UID: ${d.uid}
//             `
//             )
//             .style("left", `${event.pageX + 20}px`)
//             .style("top", `${event.pageY - 10}px`);
//         })
//         .on("mousemove", function (event) {
//           tooltip
//             .style("left", `${event.pageX + 20}px`)
//             .style("top", `${event.pageY - 10}px`);
//         })
//         .on("mouseout", function () {
//           setHoveredIndex(null);
//           tooltip.style("visibility", "hidden");
//         })
//         .on("click", function (event, d) {
//           const index = data.dataPoints.findIndex((item) => item === d);
//           d3.select(this).raise();
//           setSelectedData(index);
//           if (data.onSelect) {
//             data.onSelect(index);
//           }
//         });
//     }

//     // Add auxiliary lines for selected point
//     if (
//       selectedData !== null &&
//       data.dataPoints &&
//       data.dataPoints[selectedData]
//     ) {
//       const selectedPoint = data.dataPoints[selectedData];
//       graph
//         .append("line")
//         .attr("x1", xScale(selectedPoint.features[0]))
//         .attr("y1", yScale(selectedPoint.features[1]) + 10)
//         .attr("x2", xScale(selectedPoint.features[0]))
//         .attr("y2", height)
//         .attr("stroke", "black")
//         .attr("stroke-width", 1)
//         .attr("stroke-dasharray", "4");

//       graph
//         .append("line")
//         .attr("x1", 0)
//         .attr("y1", yScale(selectedPoint.features[1]))
//         .attr("x2", xScale(selectedPoint.features[0]) - 10)
//         .attr("y2", yScale(selectedPoint.features[1]))
//         .attr("stroke", "black")
//         .attr("stroke-width", 1)
//         .attr("stroke-dasharray", "4");
//     }

//     return () => {
//       tooltip.remove();
//     };
//   }, [data, selectedData, isImageMode, hoveredIndex, dimensions]);

//   const selectedPoint =
//     selectedData !== null && data.dataPoints
//       ? data.dataPoints[selectedData]
//       : null;

//   return (
//     <div
//       ref={containerRef}
//       className={tw`w-full h-full bg-transparent relative`}
//     >
//       <svg
//         ref={svgRef}
//         className={tw`w-full h-full`}
//         style={{ background: "transparent" }}
//       />
//     </div>
//   );
// };

// export default ExhiInputField;
