import React, { useState } from "react";
import { Handle, Position } from "@xyflow/react";
import { tw } from "twind";
import { FaSyncAlt, FaQuestionCircle } from "react-icons/fa"; // Import reload and question icon
import network from "../images/network2.png";

const BlackBox = ({ data, isConnectable }) => {
  const [isGlowing, setIsGlowing] = useState(false); // State for glow effect
  const [isRotating, setIsRotating] = useState(false); // State for rotation effect
  const nodeWidth = 200;
  const nodeHeight = 150;

  const handleTrain = () => {
    // call the train function
    data.handleTrain();

    // Trigger glow effect
    setIsGlowing(true);
    setTimeout(() => setIsGlowing(false), 500); // Remove glow after 1 second

    // Trigger rotation
    setIsRotating(true);
    setTimeout(() => setIsRotating(false), 500); // Stop rotation after 1 second
  };

  const [isExplanationVisible, setIsExplanationVisible] = useState(false); // State for explanation bubble
  const toggleExplanation = () => {
    setIsExplanationVisible((prev) => !prev); // Toggle explanation visibility
  };

  return (
    <>
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
        className={tw`w-2 h-2 bg-blue-400`}
      />
      <div
        className={tw`w-[${nodeWidth}px] h-[${nodeHeight}px] p-0 m-0 bg-gray-100 border border-gray-300 rounded-md flex flex-col items-center justify-center relative transition-all duration-500 ${
          isGlowing ? "ring-8 ring-yellow-200 ring-opacity-30 blur-sm" : ""
        }`}
        style={{
          backgroundSize: "100px 100px", // Manually set the background image size
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          opacity: 1, // Make the rest of the content fully displayed
        }}
      >
        <div
          style={{
            backgroundImage: `url(${network})`,
            opacity: 0.2, // Make only the image 10% transparent
            position: "absolute",
            width: "100%",
            height: "100%",
            // change the size of the background image
            backgroundSize: "150px",
            // change the position of the background image
            backgroundPosition: "center",
            zIndex: 1,
          }}
        ></div>
        <p
          className={tw`text-gray-600 text-center text-[20px] mb-2 font-bold`}
          style={{
            zIndex: 2,
            //shadow for text
            textShadow: "5px 5px 3px rgba(255,255,255,1)",
          }}
        >
          Neural Network
        </p>
        <button
          onClick={handleTrain}
          className={tw`px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-700 flex items-center`}
          style={{ zIndex: 2 }} // Make the button always on top
        >
          <FaSyncAlt
            className={tw`mr-2 transition-transform duration-1000 ${
              isRotating ? "rotate-[360deg]" : ""
            }`}
          />
          Train
        </button>
      </div>
      <Handle
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
        className={tw`w-2 h-2 bg-blue-400`}
      />
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
          }px] bg-white border border-gray-300 rounded-md p-2 shadow-lg text-xs w-40`}
        >
          <p className={tw`pb-[5px]`}>
            After you selected the data, click the{" "}
            <strong className={tw`text-blue-500 font-bold`}>Train</strong>{" "}
            button to train the neural network.
          </p>
          <p>
            You need to click{" "}
            <strong className={tw`text-blue-500 font-bold`}>
              multiple times
            </strong>{" "}
            to improve the results.
          </p>
        </div>
      )}
    </>
  );
};

export default BlackBox;
