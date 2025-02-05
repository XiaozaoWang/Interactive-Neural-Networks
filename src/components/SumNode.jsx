import React, { useState, useEffect, useRef } from "react";
import { Handle, Position } from "@xyflow/react";
import { tw } from "twind";
import * as d3 from "d3";
import { TbSum } from "react-icons/tb";
import { MathJax, MathJaxContext } from "better-react-mathjax";

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

  const [isHovered, setIsHovered] = useState(false);
  const [toggleEquation, setToggleEquation] = useState(false);
  const [highlightedId, setHighlightedId] = useState(null);
  const [equation, setEquation] = useState("");
  const [isGlowing, setIsGlowing] = useState(true);

  // Update the graph when data.value changes
  useEffect(() => {
    const svg = d3.select(svgRef.current);
    // transition the progress bar to the new y position

    svg
      .select("rect.progress")
      .transition()
      .duration(isDragging ? 0 : 200)
      .attr("y", nodeHeight - scale(data.sum))
      .attr("height", scale(data.sum));
  }, [data.sum]); // Depend only on data.sum (passed from parent)

  // set glowing
  useEffect(() => {
    if (data.glowingEle === id) {
      setIsGlowing(true);
    } else {
      setIsGlowing(false);
    }
  }, [data.glowingEle]);

  function handleToggleEquation() {
    setToggleEquation(!toggleEquation);
  }

  const handleHover = (id) => {
    setHighlightedId(id);
    data.onParamHover(id);
  };

  const handleMouseLeave = () => {
    setHighlightedId(null);
    data.onParamHover(null);
  };

  // Render the SVG graphic initially and define dragging functiona
  useEffect(() => {
    const svg = d3.select(svgRef.current);

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
    <MathJaxContext>
      <div
        className={tw`relative rounded-md transition-shadow`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={
          isGlowing ? { boxShadow: "0 0 8px 4px rgba(255, 208, 0, 0.3)" } : {}
        }
      >
        <Handle
          type="target"
          position={Position.Left}
          isConnectable={isConnectable}
          className={tw`w-2 h-2 bg-blue-400`}
        />
        <div
          className={tw`w-[${nodeWidth}px] h-[${nodeHeight}px] p-0 m-0 bg-gray-50 border border-gray-300 rounded-md`}
          onClick={handleToggleEquation}
        >
          <svg ref={svgRef} width="100%" height="100%" />
          <div
            className={tw`absolute inset-0 flex justify-center items-center`}
          >
            <TbSum className={tw`text-gray-700 text-3xl`} />
          </div>
        </div>
        <Handle
          type="source"
          position={Position.Right}
          isConnectable={isConnectable}
          className={tw`w-2 h-2 bg-blue-400`}
        />

        {/* Interactive MathJax tooltip */}
        {toggleEquation && (
          <div
            className={tw`absolute top-[-50px] left-[-130px] bg-white shadow-md border border-gray-300 p-2 rounded-md text-[12px] flex gap-1`}
          >
            {data.inputs.map((input, i) => (
              <React.Fragment key={i}>
                <span
                  style={{
                    backgroundColor:
                      highlightedId === `i${i + 1}` ? "#FCEA8F" : "transparent",
                  }}
                  onMouseEnter={() => handleHover(`i${i + 1}`)}
                  onMouseLeave={handleMouseLeave}
                >
                  <span style={{ color: "black" }}>{input.toFixed(2)}</span>
                </span>
                <span>×</span>
                <span
                  style={{
                    backgroundColor:
                      highlightedId === `${id.slice(0, 3)}w${i + 1}`
                        ? "#FCEA8F"
                        : "transparent",
                  }}
                  onMouseEnter={() => handleHover(`${id.slice(0, 3)}w${i + 1}`)}
                  onMouseLeave={handleMouseLeave}
                >
                  <span style={{ color: data.weights[i] > 0 ? "blue" : "red" }}>
                    {data.weights[i].toFixed(2)}
                  </span>
                </span>
                {i < data.inputs.length - 1 && <span>+</span>}
              </React.Fragment>
            ))}
            <span>{data.bias >= 0 ? " + " : " - "}</span>
            <span
              style={{
                backgroundColor:
                  highlightedId === `${id.slice(0, 3)}b`
                    ? "#FCEA8F"
                    : "transparent",
              }}
              onMouseEnter={() => handleHover(`${id.slice(0, 3)}b`)}
              onMouseLeave={handleMouseLeave}
            >
              <span style={{ color: data.bias > 0 ? "blue" : "red" }}>
                {Math.abs(data.bias).toFixed(2)}
              </span>
            </span>
            <span> = </span>
            <span
              style={{
                backgroundColor:
                  highlightedId === `${id.slice(0, 3)}s`
                    ? "#FCEA8F"
                    : "transparent",
              }}
              onMouseEnter={() => handleHover(`${id.slice(0, 3)}s`)}
              onMouseLeave={handleMouseLeave}
            >
              <span style={{ color: "black" }}>{data.sum.toFixed(2)}</span>
            </span>
          </div>
        )}
      </div>
    </MathJaxContext>
  );
};

export default SumNode;

// MathTex ver

// import React, { useState, useEffect, useRef } from "react";
// import { Handle, Position } from "@xyflow/react";
// import { tw } from "twind";
// import * as d3 from "d3";
// import { TbSum } from "react-icons/tb";
// import { MathJax, MathJaxContext } from "better-react-mathjax";

// const SumNode = ({ id, data, isConnectable }) => {
//   const svgRef = useRef(null);
//   const [sum, setSum] = useState(data.sum);
//   const [weights, setWeights] = useState(data.weights);
//   const [bias, setBias] = useState(data.bias);

//   const nodeWidth = 30;
//   const nodeHeight = 130;
//   const scale = d3.scaleLinear().domain([-3, 3]).range([0, nodeHeight]);
//   const [height, setHeight] = useState(scale(sum)); // Keep track of the current height
//   //   const [biasHeight, setBiasHeight] = useState(scale(bias)); // Keep track of the current height
//   const [isDragging, setIsDragging] = useState(false);
//   const draggable = data.draggable ? data.draggable : false;

//   const [isHovered, setIsHovered] = useState(false);
//   const [toggleEquation, setToggleEquation] = useState(false);
//   const [highlightedId, setHighlightedId] = useState(null);
//   const [equation, setEquation] = useState("");

//   // Update the graph when data.value changes
//   useEffect(() => {
//     const svg = d3.select(svgRef.current);
//     // transition the progress bar to the new y position

//     svg
//       .select("rect.progress")
//       .transition()
//       .duration(isDragging ? 0 : 200)
//       .attr("y", nodeHeight - scale(data.sum))
//       .attr("height", scale(data.sum));
//   }, [data.sum]); // Depend only on data.sum (passed from parent)

//   // useEffect(() => {
//   //   setEquation(
//   //     `${data.inputs
//   //       .map(
//   //         (input, i) =>
//   //           `\\textcolor{black}{${input.toFixed(2)}} \\times \\textcolor{${
//   //             data.weights[i] > 0 ? "blue" : "red"
//   //           }}{${data.weights[i].toFixed(2)}}`
//   //       )
//   //       .join(" + ")} ${data.bias >= 0 ? "+" : "-"} \\textcolor{ ${
//   //       data.bias > 0 ? "blue" : "red"
//   //     } }{${Math.abs(data.bias).toFixed(
//   //       2
//   //     )}} = \\textcolor{black}{${data.sum.toFixed(2)}}`
//   //   );
//   // }, [data]);

//   function handleToggleEquation() {
//     setToggleEquation(!toggleEquation);
//   }

//   const handleHover = (id) => {
//     setHighlightedId(id);
//     console.log("Hovered on:", id);
//   };

//   const handleMouseLeave = () => {
//     setHighlightedId(null);
//   };

//   // Render the SVG graphic initially and define dragging functiona
//   useEffect(() => {
//     const svg = d3.select(svgRef.current);

//     // progress bar
//     let progress = svg.select("rect.progress");
//     if (progress.empty()) {
//       progress = svg
//         .append("rect")
//         .attr("class", "progress")
//         .attr("x", 0)
//         .attr("y", nodeHeight - height)
//         .attr("width", nodeWidth)
//         .attr("height", height)
//         .attr("fill", "#FCEA8F");
//     }

//     function dragged(event) {
//       if (!draggable) return;
//       setIsDragging(true);
//       const newY = event.y;
//       let newBiasHeight = nodeHeight - newY;
//       // constrain the height to the range [0, sliderHeight]
//       if (newBiasHeight < 0) {
//         newBiasHeight = 0;
//       } else if (newBiasHeight > nodeHeight) {
//         newBiasHeight = sliderHeight;
//       }

//       // We don't need immediate effect, we just need to pass the value back to the parent
//       const newBiasValue = parseFloat(scale.invert(newBiasHeight).toFixed(2));
//       //   setNodeValue(newValue); // Update the node value

//       data.onBiasChange(newBiasValue); // Update the value in parent
//     }

//     function dragEnded(event) {
//       setIsDragging(false);
//     }
//   }, [height, data]); // Depend on height for initial rendering and dragging

//   return (
//     <MathJaxContext
//       config={{
//         tex: {
//           loader: { load: ["[tex]/color"] },
//           packages: { "[+]": ["color"] },
//         },
//       }}
//     >
//       <div
//         className={tw`relative`}
//         onMouseEnter={() => setIsHovered(true)}
//         onMouseLeave={() => setIsHovered(false)}
//       >
//         <Handle
//           type="target"
//           position={Position.Left}
//           isConnectable={isConnectable}
//           className={tw`w-2 h-2 bg-blue-400`}
//         />
//         <div
//           className={tw`w-[${nodeWidth}px] h-[${nodeHeight}px] p-0 m-0 bg-gray-50 border border-gray-300 rounded-md`}
//           onClick={handleToggleEquation}
//         >
//           <svg ref={svgRef} width="100%" height="100%" />
//           <div
//             className={tw`absolute inset-0 flex justify-center items-center`}
//           >
//             <TbSum className={tw`text-gray-700 text-3xl`} />
//           </div>
//         </div>
//         <Handle
//           type="source"
//           position={Position.Right}
//           isConnectable={isConnectable}
//           className={tw`w-2 h-2 bg-blue-400`}
//         />

//         {/* Interactive MathJax tooltip */}
//         {toggleEquation && (
//           <div
//             className={tw`absolute top-[-50px] left-[-130px] bg-white shadow-md border border-gray-300 p-2 rounded-md text-[12px] flex gap-1`}
//           >
//             {data.inputs.map((input, i) => (
//               <React.Fragment key={i}>
//                 <div
//                   className={tw`inline-block${
//                     highlightedId === `i${i + 1}` ? "bg-yellow-200" : ""
//                   }`}
//                   onMouseEnter={() => handleHover(`i${i + 1}`)}
//                   onMouseLeave={handleMouseLeave}
//                 >
//                   <MathJax>{`\\( ${`\\textcolor{black}{${data.inputs[i].toFixed(
//                     2
//                   )}}`} \\)`}</MathJax>
//                 </div>
//                 <span>×</span>
//                 <div
//                   className={tw`inline-block ${
//                     highlightedId === `${id.slice(0, 3)}w${i + 1}`
//                       ? "bg-yellow-200"
//                       : ""
//                   }`}
//                   onMouseEnter={() => handleHover(`${id.slice(0, 3)}w${i + 1}`)}
//                   onMouseLeave={handleMouseLeave}
//                 >
//                   <MathJax>{`\\( ${`\\textcolor{${
//                     data.weights[i] > 0 ? "blue" : "red"
//                   }}{${data.weights[i].toFixed(2)}}`} \\)`}</MathJax>
//                 </div>
//                 {i < data.inputs.length - 1 && <span>+</span>}
//               </React.Fragment>
//             ))}
//             <span>{data.bias >= 0 ? " + " : " - "}</span>
//             <div
//               className={tw`inline-block ${
//                 highlightedId === `${id.slice(0, 3)}b` ? "bg-yellow-200" : ""
//               }`}
//               onMouseEnter={() => handleHover(`${id.slice(0, 3)}b`)}
//               onMouseLeave={handleMouseLeave}
//             >
//               <MathJax>{`\\( ${`\\textcolor{${
//                 data.bias > 0 ? "blue" : "red"
//               }}{${Math.abs(data.bias).toFixed(2)}}`} \\)`}</MathJax>
//             </div>
//             <span> = </span>
//             <div
//               className={tw`inline-block ${
//                 highlightedId === `${id.slice(0, 3)}s` ? "bg-yellow-200" : ""
//               }`}
//               onMouseEnter={() => handleHover(`${id.slice(0, 3)}s`)}
//               onMouseLeave={handleMouseLeave}
//             >
//               <MathJax>{`\\( ${`\\textcolor{black}{${data.sum.toFixed(
//                 2
//               )}}`} \\)`}</MathJax>
//             </div>
//           </div>
//         )}
//       </div>
//     </MathJaxContext>
//   );
// };

// export default SumNode;
