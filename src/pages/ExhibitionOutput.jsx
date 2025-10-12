import React, { useState, useEffect } from "react";
import { tw } from "twind";
import { useSocket } from "../SocketProvider.jsx";
import { ImArrowUp, ImArrowDown } from "react-icons/im";

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
    <div className={tw`w-full h-screen flex flex-row bg-gray-50`}>
      {/* LEFT PANEL - Prediction Output */}
      <div
        className={tw`w-1/2 h-full bg-white border-r border-gray-200 p-6 flex flex-col`}
      >
        <div
          className={tw`flex-1 overflow-auto text-center bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col justify-center`}
        >
          <h2 className={tw`text-xl font-semibold text-gray-800 mb-6`}>
            Prediction Output
          </h2>

          <div className={tw`relative mb-8 flex justify-center`}>
            {/* Gradient Strip Container */}
            <div
              className={tw`relative h-80 w-16 rounded-lg overflow-hidden shadow-sm border border-gray-200`}
            >
              {/* Vertical Gradient */}
              <div
                className={tw`w-full h-full`}
                style={{
                  background:
                    "linear-gradient(to bottom, #4CC9E1 0%, #9C4CE1 50%, #E1504C 100%)",
                }}
              />

              {/* Marker */}
              <div
                className={tw`absolute left-1/2 transform -translate-x-1/2 w-6 h-6 bg-white rounded-full shadow-sm border border-gray-300 flex items-center justify-center transition-all duration-300`}
                style={{ top: `${100 - markerPosition}%` }}
              >
                <div className={tw`w-3 h-3 bg-gray-700 rounded-full`} />
              </div>

              {/* Current Prediction Value - positioned on the strip */}
              <div
                className={tw`absolute left-full ml-2 transform -translate-y-1/2 transition-all duration-300`}
                style={{ top: `${100 - markerPosition}%` }}
              >
                <div
                  className={tw`bg-white px-2 py-1 rounded shadow-sm border border-gray-200`}
                >
                  <div
                    className={tw`text-lg font-bold ${
                      prediction >= 0 ? "text-blue-600" : "text-red-600"
                    }`}
                  >
                    {prediction.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>

            {/* Labels - positioned closer to the strip */}
            <div
              className={tw`absolute -left-2 top-0 flex flex-col items-center`}
            >
              <span className={tw`text-lg font-bold text-gray-700`}>1</span>
            </div>

            <div
              className={tw`absolute -left-2 bottom-0 flex flex-col items-center`}
            >
              <span className={tw`text-lg font-bold text-gray-700`}>-1</span>
            </div>

            {/* Class Images - positioned to the right of the strip ends */}
            <div
              className={tw`absolute right-0 top-0 flex flex-col items-center transform translate-x-full`}
            >
              <img
                src={boubaIcon}
                alt="bouba"
                className={tw`w-12 h-12 mb-1 ${
                  prediction >= 0 ? "ring-2 ring-blue-400 rounded-full" : ""
                }`}
              />
              <span className={tw`text-xs font-medium text-gray-700`}>
                bouba
              </span>
            </div>

            <div
              className={tw`absolute right-0 bottom-0 flex flex-col items-center transform translate-x-full`}
            >
              <img
                src={kikiIcon}
                alt="kiki"
                className={tw`w-12 h-12 mb-1 ${
                  prediction < 0 ? "ring-2 ring-red-400 rounded-full" : ""
                }`}
              />
              <span className={tw`text-xs font-medium text-gray-700`}>
                kiki
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* CENTER PANEL - Neural Network */}
      <div className={tw`flex-1 flex items-center justify-center bg-gray-50`}>
        <div
          className={tw`w-11/12 h-5/6 bg-white rounded-xl p-6 shadow-sm border border-gray-100`}
        >
          <h2
            className={tw`text-xl font-semibold text-gray-800 mb-6 text-center`}
          >
            Neural Network
          </h2>

          {/* Speech Bubble */}
          <div className={tw`mb-8`}>
            <div
              className={tw`bg-gray-50 rounded-lg p-6 border border-gray-200`}
            >
              <div
                className={tw`text-lg text-gray-800 leading-relaxed text-center`}
              >
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
                <div className={tw`mt-3 text-sm text-gray-600 text-center`}>
                  Based on input: [{inputData[0]?.toFixed(2)},{" "}
                  {inputData[1]?.toFixed(2)}]
                </div>
              )}
            </div>
          </div>

          {/* Gradient Visualization - Only show if gradients exist */}
          {gradients.length > 0 && (
            <div
              className={tw`bg-gray-50 rounded-lg p-4 border border-gray-200`}
            >
              <h4
                className={tw`text-sm font-semibold text-gray-700 mb-3 text-center`}
              >
                Gradient Direction
              </h4>
              <div className={tw`flex justify-center items-center space-x-8`}>
                {/* Weight 1 Gradient Arrow */}
                <div className={tw`flex flex-col items-center`}>
                  <div className={tw`text-xs text-gray-500 mb-2`}>W1</div>
                  <div
                    className={tw`relative w-12 h-8 flex items-center justify-center`}
                  >
                    {gradients[0]?.grad > 0 && (
                      <ImArrowDown className={tw`text-2xl text-red-600`} />
                    )}
                    {gradients[0]?.grad < 0 && (
                      <ImArrowUp className={tw`text-2xl text-green-600`} />
                    )}
                    {gradients[0]?.grad === 0 && (
                      <div className={tw`text-2xl text-gray-400`}>→</div>
                    )}
                  </div>
                </div>

                {/* Weight 2 Gradient Arrow */}
                <div className={tw`flex flex-col items-center`}>
                  <div className={tw`text-xs text-gray-500 mb-2`}>W2</div>
                  <div
                    className={tw`relative w-12 h-8 flex items-center justify-center`}
                  >
                    {gradients[1]?.grad > 0 && (
                      <ImArrowDown className={tw`text-2xl text-red-600`} />
                    )}
                    {gradients[1]?.grad < 0 && (
                      <ImArrowUp className={tw`text-2xl text-green-600`} />
                    )}
                    {gradients[1]?.grad === 0 && (
                      <div className={tw`text-2xl text-gray-400`}>→</div>
                    )}
                  </div>
                </div>

                {/* Bias Gradient Arrow */}
                <div className={tw`flex flex-col items-center`}>
                  <div className={tw`text-xs text-gray-500 mb-2`}>B</div>
                  <div
                    className={tw`relative w-12 h-8 flex items-center justify-center`}
                  >
                    {gradients[2]?.grad > 0 && (
                      <ImArrowDown className={tw`text-2xl text-red-600`} />
                    )}
                    {gradients[2]?.grad < 0 && (
                      <ImArrowUp className={tw`text-2xl text-green-600`} />
                    )}
                    {gradients[2]?.grad === 0 && (
                      <div className={tw`text-2xl text-gray-400`}>→</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
