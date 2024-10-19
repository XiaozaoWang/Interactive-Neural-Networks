import React from "react";
import { FaRegSmile, FaRegMeh, FaRegFrown } from "react-icons/fa"; // Import the necessary icons
import { tw } from "twind";

const FaceNode = ({ id, data }) => {
  // Determine which icon to show based on the value
  const size = 35;
  const renderFace = () => {
    if (data.value > 0.5) {
      return <FaRegFrown className={tw`text-red-500`} size={size} />; // Sad face
    } else if (data.value > 0.1) {
      return <FaRegMeh className={tw`text-yellow-500`} size={size} />; // Meh face
    } else {
      return <FaRegSmile className={tw`text-green-500`} size={size} />; // Happy face
    }
  };

  return (
    <div
      className={tw`p-0 m-0 bg-gray-50 border border-gray-100 rounded-md flex items-center justify-center`}
    >
      {renderFace()} {/* Render the appropriate face icon */}
    </div>
  );
};

export default FaceNode;
