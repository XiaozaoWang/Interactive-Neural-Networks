import React, { useState, useEffect } from "react";
import { tw } from "twind";
import { useSocket } from "../SocketProvider.jsx";

// Import images for the classes
import kikiIcon from "../images/kiki-bouba/kikiIcon.jpg";
import boubaIcon from "../images/kiki-bouba/boubaIcon.jpg";

export default function Page3() {
  const socket = useSocket();

  const [prediction, setPrediction] = useState(0);
  const [target, setTarget] = useState(1);
  const [inputData, setInputData] = useState([0, 0]);
  const [weights, setWeights] = useState([0, 0]);
  const [bias, setBias] = useState(0);
  const [isTraining, setIsTraining] = useState(false);
  const [gradients, setGradients] = useState([]);

  // Listen for prediction data from Page 2
  useEffect(() => {
    if (socket) {
      socket.on("page2ToPage3", (data) => {
        setPrediction(parseFloat(data.prediction));
        setTarget(data.target);
        setInputData(data.inputData);
      });

      // Listen for gradients update after training
      socket.on("gradientsUpdate", (data) => {
        setGradients(data.gradients);
        setWeights(data.weights);
        setBias(data.bias);
        setIsTraining(false);
      });

      return () => {
        socket.off("page2ToPage3");
        socket.off("gradientsUpdate");
      };
    }
  }, [socket]);

  // Function to render gradient visualization
  const renderGradientArrow = (gradValue) => {
    if (gradValue > 0) {
      return (
        <div className={tw`flex items-center text-green-600`}>
          <span className={tw`text-lg`}>↑</span>
          <span className={tw`text-sm ml-1`}>+{gradValue.toFixed(4)}</span>
        </div>
      );
    } else if (gradValue < 0) {
      return (
        <div className={tw`flex items-center text-red-600`}>
          <span className={tw`text-lg`}>↓</span>
          <span className={tw`text-sm ml-1`}>{gradValue.toFixed(4)}</span>
        </div>
      );
    } else {
      return (
        <div className={tw`flex items-center text-gray-400`}>
          <span className={tw`text-lg`}>→</span>
          <span className={tw`text-sm ml-1`}>0.0000</span>
        </div>
      );
    }
  };

  const handleTrainOnce = () => {
    if (socket) {
      setIsTraining(true);
      socket.emit("trainOnce");
    }
  };

  // Calculate confidence percentage and class
  const confidence = Math.abs(prediction) * 100;
  const predictedClass = prediction >= 0 ? "bouba" : "kiki";
  const isCorrect =
    (prediction >= 0 && target === 1) || (prediction < 0 && target === -1);

  // Calculate marker position for the gradient strip (0% = kiki, 100% = bouba)
  const markerPosition = ((prediction + 1) / 2) * 100;

  return (
    <div
      className={tw`w-full h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-8`}
    >
      <div
        className={tw`bg-white rounded-2xl shadow-2xl p-8 max-w-6xl w-full flex gap-12`}
      >
        {/* Left Section - Gradient Strip */}
        <div className={tw`flex-1 flex flex-col items-center`}>
          <h2 className={tw`text-2xl font-bold text-gray-800 mb-6`}>
            Prediction Output
          </h2>

          <div className={tw`relative mb-8`}>
            {/* Gradient Strip Container */}
            <div
              className={tw`relative h-96 w-20 rounded-2xl overflow-hidden shadow-lg`}
            >
              {/* Vertical Gradient */}
              <div
                className={tw`w-full h-full`}
                style={{
                  background:
                    "linear-gradient(to bottom, #4CC9E1 0%, #4C6EE1 25%, #9c4CE1 50%, #E1504C 75%, #e1674c 100%)",
                }}
              />

              {/* Marker */}
              <div
                className={tw`absolute left-1/2 transform -translate-x-1/2 w-8 h-8 bg-white rounded-full shadow-lg border-2 border-gray-300 flex items-center justify-center`}
                style={{ top: `${100 - markerPosition}%` }}
              >
                <div className={tw`w-4 h-4 bg-gray-700 rounded-full`} />
              </div>
            </div>

            {/* Labels */}
            <div
              className={tw`absolute -left-4 top-0 flex flex-col items-center`}
            >
              <span
                className={tw`text-lg font-bold text-gray-700 bg-white px-2 py-1 rounded-lg shadow-sm`}
              >
                1
              </span>
              <span className={tw`text-xs text-gray-500 mt-1`}>bouba</span>
            </div>

            <div
              className={tw`absolute -left-4 bottom-0 flex flex-col items-center`}
            >
              <span
                className={tw`text-lg font-bold text-gray-700 bg-white px-2 py-1 rounded-lg shadow-sm`}
              >
                -1
              </span>
              <span className={tw`text-xs text-gray-500 mt-1`}>kiki</span>
            </div>
          </div>

          {/* Current Prediction Value */}
          <div className={tw`text-center`}>
            <div className={tw`text-sm text-gray-600 mb-1`}>
              Current Prediction
            </div>
            <div
              className={tw`text-3xl font-bold ${
                prediction >= 0 ? "text-blue-600" : "text-red-600"
              }`}
            >
              {prediction.toFixed(2)}
            </div>
          </div>

          {/* Class Images */}
          <div className={tw`flex justify-between w-full mt-6 px-4`}>
            <div className={tw`flex flex-col items-center`}>
              <img
                src={boubaIcon}
                alt="bouba"
                className={tw`w-16 h-16 mb-2 ${
                  prediction >= 0 ? "ring-4 ring-blue-400 rounded-full" : ""
                }`}
              />
              <span className={tw`text-sm font-medium text-gray-700`}>
                bouba
              </span>
            </div>
            <div className={tw`flex flex-col items-center`}>
              <img
                src={kikiIcon}
                alt="kiki"
                className={tw`w-16 h-16 mb-2 ${
                  prediction < 0 ? "ring-4 ring-red-400 rounded-full" : ""
                }`}
              />
              <span className={tw`text-sm font-medium text-gray-700`}>
                kiki
              </span>
            </div>
          </div>
        </div>

        {/* Right Section - Neural Network Output */}
        <div className={tw`flex-1 flex flex-col`}>
          <h2 className={tw`text-2xl font-bold text-gray-800 mb-6`}>
            Neural Network
          </h2>

          {/* Speech Bubble */}
          <div className={tw`mb-8`}>
            <div
              className={tw`relative bg-gradient-to-r from-purple-100 to-blue-100 rounded-3xl p-6 shadow-lg border border-purple-200`}
            >
              <div
                className={tw`absolute -left-4 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-gradient-to-r from-purple-100 to-blue-100 rotate-45 border-l border-b border-purple-200`}
              ></div>

              <div className={tw`text-lg text-gray-800 leading-relaxed`}>
                <span className={tw`font-semibold`}>
                  I'm {confidence.toFixed(1)}% confident
                </span>{" "}
                that this is{" "}
                <span
                  className={tw`font-bold ${
                    predictedClass === "bouba"
                      ? "text-blue-600"
                      : "text-red-600"
                  }`}
                >
                  {predictedClass}
                </span>
                {isCorrect ? (
                  <span className={tw`text-green-600 ml-2`}>✓</span>
                ) : (
                  <span className={tw`text-orange-600 ml-2`}>?</span>
                )}
              </div>

              {inputData && (
                <div className={tw`mt-3 text-sm text-gray-600`}>
                  Based on input: [{inputData[0]?.toFixed(2)},{" "}
                  {inputData[1]?.toFixed(2)}]
                </div>
              )}
            </div>
          </div>

          {/* Train Button */}
          <div className={tw`mb-8`}>
            <button
              onClick={handleTrainOnce}
              disabled={isTraining}
              className={tw`w-full py-4 px-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
            >
              {isTraining ? (
                <div className={tw`flex items-center justify-center`}>
                  <div
                    className={tw`animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3`}
                  ></div>
                  Training...
                </div>
              ) : (
                "Train Once"
              )}
            </button>

            <div className={tw`text-xs text-gray-500 text-center mt-2`}>
              Click to improve the neural network's prediction
            </div>
          </div>

          {/* Parameters Display */}
          <div className={tw`bg-gray-50 rounded-xl p-6 border border-gray-200`}>
            <h3 className={tw`text-lg font-semibold text-gray-800 mb-4`}>
              Current Parameters
            </h3>

            <div className={tw`space-y-4`}>
              <div className={tw`flex justify-between items-center`}>
                <span className={tw`text-gray-600`}>Weight 1:</span>
                <span className={tw`text-lg font-mono font-bold text-blue-600`}>
                  {weights[0]?.toFixed(4) || "0.0000"}
                </span>
              </div>
              {gradients.length > 0 && (
                <div className={tw`flex justify-between items-center ml-4`}>
                  <span className={tw`text-sm text-gray-500`}>Gradient:</span>
                  {renderGradientArrow(gradients[0]?.grad)}
                </div>
              )}

              <div className={tw`flex justify-between items-center`}>
                <span className={tw`text-gray-600`}>Weight 2:</span>
                <span className={tw`text-lg font-mono font-bold text-blue-600`}>
                  {weights[1]?.toFixed(4) || "0.0000"}
                </span>
              </div>
              {gradients.length > 0 && (
                <div className={tw`flex justify-between items-center ml-4`}>
                  <span className={tw`text-sm text-gray-500`}>Gradient:</span>
                  {renderGradientArrow(gradients[1]?.grad)}
                </div>
              )}

              <div className={tw`flex justify-between items-center`}>
                <span className={tw`text-gray-600`}>Bias:</span>
                <span
                  className={tw`text-lg font-mono font-bold text-purple-600`}
                >
                  {bias?.toFixed(4) || "0.0000"}
                </span>
              </div>
              {gradients.length > 0 && (
                <div className={tw`flex justify-between items-center ml-4`}>
                  <span className={tw`text-sm text-gray-500`}>Gradient:</span>
                  {renderGradientArrow(gradients[2]?.grad)}
                </div>
              )}
            </div>

            {/* Additional Info */}
            <div className={tw`mt-6 pt-4 border-t border-gray-200`}>
              <div className={tw`flex justify-between text-sm text-gray-600`}>
                <span>Target Class:</span>
                <span
                  className={tw`font-semibold ${
                    target === 1 ? "text-blue-600" : "text-red-600"
                  }`}
                >
                  {target === 1 ? "bouba" : "kiki"}
                </span>
              </div>

              <div
                className={tw`flex justify-between text-sm text-gray-600 mt-2`}
              >
                <span>Accuracy:</span>
                <span
                  className={tw`font-semibold ${
                    isCorrect ? "text-green-600" : "text-orange-600"
                  }`}
                >
                  {isCorrect ? "Correct" : "Incorrect"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// // src/pages/Page3.jsx
// import React, { useState, useEffect } from "react";
// import { tw } from "twind";
// import { useSocket } from "../SocketProvider.jsx";

// // Import images for the classes
// import kikiIcon from "../images/kiki-bouba/kikiIcon.jpg";
// import boubaIcon from "../images/kiki-bouba/boubaIcon.jpg";

// export default function Page3() {
//   const socket = useSocket();

//   const [prediction, setPrediction] = useState(0);
//   const [target, setTarget] = useState(1);
//   const [inputData, setInputData] = useState([0, 0]);
//   const [weights, setWeights] = useState([0, 0]);
//   const [bias, setBias] = useState(0);
//   const [isTraining, setIsTraining] = useState(false);

//   // Listen for prediction data from Page 2
//   useEffect(() => {
//     if (socket) {
//       socket.on("page2ToPage3", (data) => {
//         setPrediction(parseFloat(data.prediction));
//         setTarget(data.target);
//         setInputData(data.inputData);

//         // If parameters are included, update them
//         if (data.weights) {
//           setWeights(data.weights);
//         }
//         if (data.bias !== undefined) {
//           setBias(data.bias);
//         }
//       });

//       // Listen for parameter updates after training
//       socket.on("updateParams", (data) => {
//         setWeights(data.weights);
//         setBias(data.bias);
//         setIsTraining(false);
//       });

//       return () => {
//         socket.off("page2ToPage3");
//         socket.off("updateParams");
//       };
//     }
//   }, [socket]);

//   const handleTrainOnce = () => {
//     if (socket) {
//       // setIsTraining(true);
//       socket.emit("trainOnce");
//     }
//   };

//   // Calculate confidence percentage and class
//   const confidence = Math.abs(prediction) * 100;
//   const predictedClass = prediction >= 0 ? "bouba" : "kiki";
//   const isCorrect =
//     (prediction >= 0 && target === 1) || (prediction < 0 && target === -1);

//   // Calculate marker position for the gradient strip (0% = kiki, 100% = bouba)
//   const markerPosition = ((prediction + 1) / 2) * 100;

//   return (
//     <div
//       className={tw`w-full h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-8`}
//     >
//       <div
//         className={tw`bg-white rounded-2xl shadow-2xl p-8 max-w-6xl w-full flex gap-12`}
//       >
//         {/* Left Section - Gradient Strip */}
//         <div className={tw`flex-1 flex flex-col items-center`}>
//           <h2 className={tw`text-2xl font-bold text-gray-800 mb-6`}>
//             Prediction Output
//           </h2>

//           <div className={tw`relative mb-8`}>
//             {/* Gradient Strip Container */}
//             <div
//               className={tw`relative h-96 w-20 rounded-2xl overflow-hidden shadow-lg`}
//             >
//               {/* Vertical Gradient */}
//               <div
//                 className={tw`w-full h-full`}
//                 style={{
//                   background:
//                     "linear-gradient(to bottom, #4CC9E1 0%, #4C6EE1 25%, #9c4CE1 50%, #E1504C 75%, #e1674c 100%)",
//                 }}
//               />

//               {/* Marker */}
//               <div
//                 className={tw`absolute left-1/2 transform -translate-x-1/2 w-8 h-8 bg-white rounded-full shadow-lg border-2 border-gray-300 flex items-center justify-center`}
//                 style={{ top: `${100 - markerPosition}%` }}
//               >
//                 <div className={tw`w-4 h-4 bg-gray-700 rounded-full`} />
//               </div>
//             </div>

//             {/* Labels */}
//             <div
//               className={tw`absolute -left-4 top-0 flex flex-col items-center`}
//             >
//               <span
//                 className={tw`text-lg font-bold text-gray-700 bg-white px-2 py-1 rounded-lg shadow-sm`}
//               >
//                 1
//               </span>
//               <span className={tw`text-xs text-gray-500 mt-1`}>bouba</span>
//             </div>

//             <div
//               className={tw`absolute -left-4 bottom-0 flex flex-col items-center`}
//             >
//               <span
//                 className={tw`text-lg font-bold text-gray-700 bg-white px-2 py-1 rounded-lg shadow-sm`}
//               >
//                 -1
//               </span>
//               <span className={tw`text-xs text-gray-500 mt-1`}>kiki</span>
//             </div>
//           </div>

//           {/* Current Prediction Value */}
//           <div className={tw`text-center`}>
//             <div className={tw`text-sm text-gray-600 mb-1`}>
//               Current Prediction
//             </div>
//             <div
//               className={tw`text-3xl font-bold ${
//                 prediction >= 0 ? "text-blue-600" : "text-red-600"
//               }`}
//             >
//               {prediction.toFixed(2)}
//             </div>
//           </div>

//           {/* Class Images */}
//           <div className={tw`flex justify-between w-full mt-6 px-4`}>
//             <div className={tw`flex flex-col items-center`}>
//               <img
//                 src={boubaIcon}
//                 alt="bouba"
//                 className={tw`w-16 h-16 mb-2 ${
//                   prediction >= 0 ? "ring-4 ring-blue-400 rounded-full" : ""
//                 }`}
//               />
//               <span className={tw`text-sm font-medium text-gray-700`}>
//                 bouba
//               </span>
//             </div>
//             <div className={tw`flex flex-col items-center`}>
//               <img
//                 src={kikiIcon}
//                 alt="kiki"
//                 className={tw`w-16 h-16 mb-2 ${
//                   prediction < 0 ? "ring-4 ring-red-400 rounded-full" : ""
//                 }`}
//               />
//               <span className={tw`text-sm font-medium text-gray-700`}>
//                 kiki
//               </span>
//             </div>
//           </div>
//         </div>

//         {/* Right Section - Neural Network Output */}
//         <div className={tw`flex-1 flex flex-col`}>
//           <h2 className={tw`text-2xl font-bold text-gray-800 mb-6`}>
//             Neural Network
//           </h2>

//           {/* Speech Bubble */}
//           <div className={tw`mb-8`}>
//             <div
//               className={tw`relative bg-gradient-to-r from-purple-100 to-blue-100 rounded-3xl p-6 shadow-lg border border-purple-200`}
//             >
//               <div
//                 className={tw`absolute -left-4 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-gradient-to-r from-purple-100 to-blue-100 rotate-45 border-l border-b border-purple-200`}
//               ></div>

//               <div className={tw`text-lg text-gray-800 leading-relaxed`}>
//                 <span className={tw`font-semibold`}>
//                   I'm {confidence.toFixed(1)}% confident
//                 </span>{" "}
//                 that this is{" "}
//                 <span
//                   className={tw`font-bold ${
//                     predictedClass === "bouba"
//                       ? "text-blue-600"
//                       : "text-red-600"
//                   }`}
//                 >
//                   {predictedClass}
//                 </span>
//                 {isCorrect ? (
//                   <span className={tw`text-green-600 ml-2`}>✓</span>
//                 ) : (
//                   <span className={tw`text-orange-600 ml-2`}>?</span>
//                 )}
//               </div>

//               {inputData && (
//                 <div className={tw`mt-3 text-sm text-gray-600`}>
//                   Based on input: [{inputData[0]?.toFixed(2)},{" "}
//                   {inputData[1]?.toFixed(2)}]
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Train Button */}
//           <div className={tw`mb-8`}>
//             <button
//               onClick={handleTrainOnce}
//               disabled={isTraining}
//               className={tw`w-full py-4 px-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
//             >
//               {isTraining ? (
//                 <div className={tw`flex items-center justify-center`}>
//                   <div
//                     className={tw`animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3`}
//                   ></div>
//                   Training...
//                 </div>
//               ) : (
//                 "Train Once"
//               )}
//             </button>

//             <div className={tw`text-xs text-gray-500 text-center mt-2`}>
//               Click to improve the neural network's prediction
//             </div>
//           </div>

//           {/* Parameters Display */}
//           <div className={tw`bg-gray-50 rounded-xl p-6 border border-gray-200`}>
//             <h3 className={tw`text-lg font-semibold text-gray-800 mb-4`}>
//               Current Parameters
//             </h3>

//             <div className={tw`space-y-4`}>
//               <div className={tw`flex justify-between items-center`}>
//                 <span className={tw`text-gray-600`}>Weight 1:</span>
//                 <span className={tw`text-lg font-mono font-bold text-blue-600`}>
//                   {weights[0]?.toFixed(4) || "0.0000"}
//                 </span>
//               </div>

//               <div className={tw`flex justify-between items-center`}>
//                 <span className={tw`text-gray-600`}>Weight 2:</span>
//                 <span className={tw`text-lg font-mono font-bold text-blue-600`}>
//                   {weights[1]?.toFixed(4) || "0.0000"}
//                 </span>
//               </div>

//               <div className={tw`flex justify-between items-center`}>
//                 <span className={tw`text-gray-600`}>Bias:</span>
//                 <span
//                   className={tw`text-lg font-mono font-bold text-purple-600`}
//                 >
//                   {bias?.toFixed(4) || "0.0000"}
//                 </span>
//               </div>
//             </div>

//             {/* Additional Info */}
//             <div className={tw`mt-6 pt-4 border-t border-gray-200`}>
//               <div className={tw`flex justify-between text-sm text-gray-600`}>
//                 <span>Target Class:</span>
//                 <span
//                   className={tw`font-semibold ${
//                     target === 1 ? "text-blue-600" : "text-red-600"
//                   }`}
//                 >
//                   {target === 1 ? "bouba" : "kiki"}
//                 </span>
//               </div>

//               <div
//                 className={tw`flex justify-between text-sm text-gray-600 mt-2`}
//               >
//                 <span>Accuracy:</span>
//                 <span
//                   className={tw`font-semibold ${
//                     isCorrect ? "text-green-600" : "text-orange-600"
//                   }`}
//                 >
//                   {isCorrect ? "Correct" : "Incorrect"}
//                 </span>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// ======================================================================================

// // src/pages/Page3.jsx
// import React, { useState, useEffect } from "react";
// import { tw } from "twind";
// import { useSocket } from "../SocketProvider.jsx";

// // Import images for the classes
// import kikiIcon from "../images/kiki-bouba/kikiIcon.jpg";
// import boubaIcon from "../images/kiki-bouba/boubaIcon.jpg";

// export default function Page3() {
//   const socket = useSocket();

//   const [prediction, setPrediction] = useState(0);
//   const [target, setTarget] = useState(1);
//   const [inputData, setInputData] = useState([0, 0]);
//   const [weights, setWeights] = useState([0, 0]);
//   const [bias, setBias] = useState(0);
//   const [isTraining, setIsTraining] = useState(false);

//   // Listen for prediction data from Page 2
//   useEffect(() => {
//     if (socket) {
//       socket.on("page2ToPage3", (data) => {
//         setPrediction(parseFloat(data.prediction));
//         setTarget(data.target);
//         setInputData(data.inputData);

//         // If parameters are included, update them
//         if (data.weights) {
//           setWeights(data.weights);
//         }
//         if (data.bias !== undefined) {
//           setBias(data.bias);
//         }
//       });

//       // Listen for parameter updates after training
//       socket.on("updateParams", (data) => {
//         setWeights(data.weights);
//         setBias(data.bias);
//         setIsTraining(false);
//       });

//       return () => {
//         socket.off("page2ToPage3");
//         socket.off("updateParams");
//       };
//     }
//   }, [socket]);

//   const handleTrainOnce = () => {
//     if (socket) {
//       // setIsTraining(true);
//       socket.emit("trainOnce");
//     }
//   };

//   // Calculate confidence percentage and class
//   const confidence = Math.abs(prediction) * 100;
//   const predictedClass = prediction >= 0 ? "bouba" : "kiki";
//   const isCorrect =
//     (prediction >= 0 && target === 1) || (prediction < 0 && target === -1);

//   // Calculate marker position for the gradient strip (0% = kiki, 100% = bouba)
//   const markerPosition = ((prediction + 1) / 2) * 100;

//   return (
//     <div
//       className={tw`w-full h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-8`}
//     >
//       <div
//         className={tw`bg-white rounded-2xl shadow-2xl p-8 max-w-6xl w-full flex gap-12`}
//       >
//         {/* Left Section - Gradient Strip */}
//         <div className={tw`flex-1 flex flex-col items-center`}>
//           <h2 className={tw`text-2xl font-bold text-gray-800 mb-6`}>
//             Prediction Output
//           </h2>

//           <div className={tw`relative mb-8`}>
//             {/* Gradient Strip Container */}
//             <div
//               className={tw`relative h-96 w-20 rounded-2xl overflow-hidden shadow-lg`}
//             >
//               {/* Vertical Gradient */}
//               <div
//                 className={tw`w-full h-full`}
//                 style={{
//                   background:
//                     "linear-gradient(to bottom, #4CC9E1 0%, #4C6EE1 25%, #9c4CE1 50%, #E1504C 75%, #e1674c 100%)",
//                 }}
//               />

//               {/* Marker */}
//               <div
//                 className={tw`absolute left-1/2 transform -translate-x-1/2 w-8 h-8 bg-white rounded-full shadow-lg border-2 border-gray-300 flex items-center justify-center`}
//                 style={{ top: `${100 - markerPosition}%` }}
//               >
//                 <div className={tw`w-4 h-4 bg-gray-700 rounded-full`} />
//               </div>
//             </div>

//             {/* Labels */}
//             <div
//               className={tw`absolute -left-4 top-0 flex flex-col items-center`}
//             >
//               <span
//                 className={tw`text-lg font-bold text-gray-700 bg-white px-2 py-1 rounded-lg shadow-sm`}
//               >
//                 1
//               </span>
//               <span className={tw`text-xs text-gray-500 mt-1`}>bouba</span>
//             </div>

//             <div
//               className={tw`absolute -left-4 bottom-0 flex flex-col items-center`}
//             >
//               <span
//                 className={tw`text-lg font-bold text-gray-700 bg-white px-2 py-1 rounded-lg shadow-sm`}
//               >
//                 -1
//               </span>
//               <span className={tw`text-xs text-gray-500 mt-1`}>kiki</span>
//             </div>
//           </div>

//           {/* Current Prediction Value */}
//           <div className={tw`text-center`}>
//             <div className={tw`text-sm text-gray-600 mb-1`}>
//               Current Prediction
//             </div>
//             <div
//               className={tw`text-3xl font-bold ${
//                 prediction >= 0 ? "text-blue-600" : "text-red-600"
//               }`}
//             >
//               {prediction.toFixed(2)}
//             </div>
//           </div>

//           {/* Class Images */}
//           <div className={tw`flex justify-between w-full mt-6 px-4`}>
//             <div className={tw`flex flex-col items-center`}>
//               <img
//                 src={boubaIcon}
//                 alt="bouba"
//                 className={tw`w-16 h-16 mb-2 ${
//                   prediction >= 0 ? "ring-4 ring-blue-400 rounded-full" : ""
//                 }`}
//               />
//               <span className={tw`text-sm font-medium text-gray-700`}>
//                 bouba
//               </span>
//             </div>
//             <div className={tw`flex flex-col items-center`}>
//               <img
//                 src={kikiIcon}
//                 alt="kiki"
//                 className={tw`w-16 h-16 mb-2 ${
//                   prediction < 0 ? "ring-4 ring-red-400 rounded-full" : ""
//                 }`}
//               />
//               <span className={tw`text-sm font-medium text-gray-700`}>
//                 kiki
//               </span>
//             </div>
//           </div>
//         </div>

//         {/* Right Section - Neural Network Output */}
//         <div className={tw`flex-1 flex flex-col`}>
//           <h2 className={tw`text-2xl font-bold text-gray-800 mb-6`}>
//             Neural Network
//           </h2>

//           {/* Speech Bubble */}
//           <div className={tw`mb-8`}>
//             <div
//               className={tw`relative bg-gradient-to-r from-purple-100 to-blue-100 rounded-3xl p-6 shadow-lg border border-purple-200`}
//             >
//               <div
//                 className={tw`absolute -left-4 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-gradient-to-r from-purple-100 to-blue-100 rotate-45 border-l border-b border-purple-200`}
//               ></div>

//               <div className={tw`text-lg text-gray-800 leading-relaxed`}>
//                 <span className={tw`font-semibold`}>
//                   I'm {confidence.toFixed(1)}% confident
//                 </span>{" "}
//                 that this is{" "}
//                 <span
//                   className={tw`font-bold ${
//                     predictedClass === "bouba"
//                       ? "text-blue-600"
//                       : "text-red-600"
//                   }`}
//                 >
//                   {predictedClass}
//                 </span>
//                 {isCorrect ? (
//                   <span className={tw`text-green-600 ml-2`}>✓</span>
//                 ) : (
//                   <span className={tw`text-orange-600 ml-2`}>?</span>
//                 )}
//               </div>

//               {inputData && (
//                 <div className={tw`mt-3 text-sm text-gray-600`}>
//                   Based on input: [{inputData[0]?.toFixed(2)},{" "}
//                   {inputData[1]?.toFixed(2)}]
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Train Button */}
//           <div className={tw`mb-8`}>
//             <button
//               onClick={handleTrainOnce}
//               disabled={isTraining}
//               className={tw`w-full py-4 px-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
//             >
//               {isTraining ? (
//                 <div className={tw`flex items-center justify-center`}>
//                   <div
//                     className={tw`animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3`}
//                   ></div>
//                   Training...
//                 </div>
//               ) : (
//                 "Train Once"
//               )}
//             </button>

//             <div className={tw`text-xs text-gray-500 text-center mt-2`}>
//               Click to improve the neural network's prediction
//             </div>
//           </div>

//           {/* Parameters Display */}
//           <div className={tw`bg-gray-50 rounded-xl p-6 border border-gray-200`}>
//             <h3 className={tw`text-lg font-semibold text-gray-800 mb-4`}>
//               Current Parameters
//             </h3>

//             <div className={tw`space-y-4`}>
//               <div className={tw`flex justify-between items-center`}>
//                 <span className={tw`text-gray-600`}>Weight 1:</span>
//                 <span className={tw`text-lg font-mono font-bold text-blue-600`}>
//                   {weights[0]?.toFixed(4) || "0.0000"}
//                 </span>
//               </div>

//               <div className={tw`flex justify-between items-center`}>
//                 <span className={tw`text-gray-600`}>Weight 2:</span>
//                 <span className={tw`text-lg font-mono font-bold text-blue-600`}>
//                   {weights[1]?.toFixed(4) || "0.0000"}
//                 </span>
//               </div>

//               <div className={tw`flex justify-between items-center`}>
//                 <span className={tw`text-gray-600`}>Bias:</span>
//                 <span
//                   className={tw`text-lg font-mono font-bold text-purple-600`}
//                 >
//                   {bias?.toFixed(4) || "0.0000"}
//                 </span>
//               </div>
//             </div>

//             {/* Additional Info */}
//             <div className={tw`mt-6 pt-4 border-t border-gray-200`}>
//               <div className={tw`flex justify-between text-sm text-gray-600`}>
//                 <span>Target Class:</span>
//                 <span
//                   className={tw`font-semibold ${
//                     target === 1 ? "text-blue-600" : "text-red-600"
//                   }`}
//                 >
//                   {target === 1 ? "bouba" : "kiki"}
//                 </span>
//               </div>

//               <div
//                 className={tw`flex justify-between text-sm text-gray-600 mt-2`}
//               >
//                 <span>Accuracy:</span>
//                 <span
//                   className={tw`font-semibold ${
//                     isCorrect ? "text-green-600" : "text-orange-600"
//                   }`}
//                 >
//                   {isCorrect ? "Correct" : "Incorrect"}
//                 </span>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// ======================================================================================

// // src/pages/Page3.jsx
// import React, { useState, useEffect } from "react";
// import {
//   ReactFlow,
//   Controls,
//   Background,
//   useNodesState,
//   useEdgesState,
//   ReactFlowProvider,
// } from "@xyflow/react";
// import "@xyflow/react/dist/style.css";
// import { tw } from "twind";

// import SliderNode from "../components/SliderNode.jsx";
// import FaceNode from "../components/FaceNode.jsx";
// import NormalEdge from "../components/NormalEdge.jsx";

// import { useSocket } from "../SocketProvider.jsx";

// const nodeTypes = {
//   SliderNode: SliderNode,
//   FaceNode: FaceNode,
// };

// const edgeTypes = {
//   NormalEdge: NormalEdge,
// };

// export default function ExhibitionOutput() {
//   const datumX = 100;
//   const datumY = 50;
//   const [nodes, setNodes, onNodesChange] = useNodesState([]);
//   const [edges, setEdges, onEdgesChange] = useEdgesState([]);

//   const socket = useSocket();

//   const [prediction, setPrediction] = useState(0);
//   const [target, setTarget] = useState(1);
//   const [inputData, setInputData] = useState([0, 0]);

//   // Listen for prediction data from Page 2
//   useEffect(() => {
//     if (socket) {
//       socket.on("page2ToPage3", (data) => {
//         setPrediction(data.prediction);
//         setTarget(data.target);
//         setInputData(data.inputData);
//       });

//       return () => {
//         socket.off("page2ToPage3");
//       };
//     }
//   }, [socket]);

//   // Update nodes when prediction changes
//   useEffect(() => {
//     const newNodes = [
//       {
//         id: "prediction",
//         data: {
//           value: Number(prediction),
//           target: target,
//           text: "Final Prediction",
//         },
//         position: {
//           x: datumX + 400,
//           y: datumY + 100,
//         },
//         type: "SliderNode",
//         draggable: false,
//       },
//       {
//         id: "face",
//         data: {
//           value: Math.abs(Number(prediction) - target),
//         },
//         position: {
//           x: datumX + 650,
//           y: datumY + 100,
//         },
//         type: "FaceNode",
//         draggable: false,
//       },
//       {
//         id: "input-info",
//         data: {
//           label: `Input: [${inputData[0]?.toFixed(2)}, ${inputData[1]?.toFixed(
//             2
//           )}]`,
//         },
//         position: {
//           x: datumX + 200,
//           y: datumY + 50,
//         },
//         type: "TextNode",
//         draggable: false,
//       },
//       {
//         id: "target-info",
//         data: {
//           label: `Target: ${target}`,
//         },
//         position: {
//           x: datumX + 200,
//           y: datumY + 100,
//         },
//         type: "TextNode",
//         draggable: false,
//       },
//     ];

//     const newEdges = [
//       {
//         id: "p-f",
//         source: "prediction",
//         target: "face",
//         animated: false,
//         type: "NormalEdge",
//       },
//     ];

//     setNodes(newNodes);
//     setEdges(newEdges);
//   }, [prediction, target, inputData]);

//   return (
//     <>
//       <ReactFlowProvider>
//         <div style={{ height: "500px", width: "1250px" }}>
//           <ReactFlow
//             nodes={nodes}
//             edges={edges}
//             nodeTypes={nodeTypes}
//             edgeTypes={edgeTypes}
//             onNodesChange={onNodesChange}
//             onEdgesChange={onEdgesChange}
//             panOnDrag={false}
//             zoomOnScroll={false}
//             zoomOnDoubleClick={false}
//           >
//             <Background bgColor="#fafafa" variant={false} />
//           </ReactFlow>
//         </div>
//       </ReactFlowProvider>
//     </>
//   );
// }
