// src/pages/Page1.jsx
import React, { useState, useEffect } from "react";
import { tw } from "twind";
import { useSocket } from "../SocketProvider.jsx";

import ExhiInputField from "../components/ExhiInputField.jsx";
import donut from "../images/kiki-bouba/donut.png";
import cube from "../images/kiki-bouba/cube.png";
import mop from "../images/kiki-bouba/mop.png";
import sausage from "../images/kiki-bouba/sausage.png";
import ghost from "../images/kiki-bouba/ghost.png";
import slime from "../images/kiki-bouba/slime.png";
import rock from "../images/kiki-bouba/rock.png";
import rainbow from "../images/kiki-bouba/rainbow.png";
import cloud from "../images/kiki-bouba/cloud.png";

// Data points array with the new structure
const dataPoints = [
  {
    name: "donut",
    uid: "04 BD 3E 38 C8 2A 81",
    features: [-0.8, -0.95],
    class: "kiki",
    imgaddr: donut,
  },
  {
    name: "cube",
    uid: "04 E4 4A 38 C8 2A 81",
    features: [-0.95, -0.75],
    class: "kiki",
    imgaddr: cube,
  },
  {
    name: "mop",
    uid: "04 8E 4A 38 C8 2A 81",
    features: [-0.9, -0.85],
    class: "kiki",
    imgaddr: mop,
  },
  {
    name: "sausage",
    uid: "04 1D 4A 38 C8 2A 81",
    features: [-0.8, -0.7],
    class: "kiki",
    imgaddr: sausage,
  },
  {
    name: "ghost",
    uid: "04 3A 4A 38 C8 2A 81",
    features: [-0.7, -0.7],
    class: "kiki",
    imgaddr: ghost,
  },
  {
    name: "slime",
    uid: "04 E4 4A 38 C8 2A 81",
    features: [0.95, 0.7],
    class: "bouba",
    imgaddr: slime,
  },
  {
    name: "rock",
    uid: "04 6C 4A 38 C8 2A 81",
    features: [0.7, 0.95],
    class: "bouba",
    imgaddr: rock,
  },
  {
    name: "rainbow",
    uid: "04 7D 4A 38 C8 2A 81",
    features: [0.9, 0.8],
    class: "bouba",
    imgaddr: rainbow,
  },
  {
    name: "cloud",
    uid: "04 9E 4A 38 C8 2A 81",
    features: [0.85, 0.9],
    class: "bouba",
    imgaddr: cloud,
  },
];

export default function Page1() {
  const socket = useSocket();

  const [currentDataPoints, setCurrentDataPoints] = useState([]);
  const [selectedData, setSelectedData] = useState(null);
  const [mapUnits, setMapUnits] = useState(20);
  const [mapPredictions, setMapPredictions] = useState([[]]);
  const [searchInput, setSearchInput] = useState("");

  // Convert class to target value (kiki: 1, bouba: -1)
  const getTargetValue = (className) => {
    return className === "kiki" ? 1 : -1;
  };

  const onSelect = (idx) => {
    setSelectedData(idx);

    if (socket && currentDataPoints[idx]) {
      const dataPoint = currentDataPoints[idx];
      socket.emit("page1ToPage2", {
        selectedIndex: idx,
        inputData: dataPoint.features,
        targetData: getTargetValue(dataPoint.class),
        dataPoint: dataPoint,
      });
    }
  };

  const handleAddDataPoint = () => {
    const name = searchInput.trim().toLowerCase();
    // Find the data point in the array by name
    const dataPoint = dataPoints.find((dp) => dp.name.toLowerCase() === name);

    if (
      dataPoint &&
      !currentDataPoints.find((dp) => dp.name === dataPoint.name)
    ) {
      setCurrentDataPoints((prev) => [...prev, dataPoint]);
      setSearchInput("");

      // Auto-select the newly added data point
      const newIndex = currentDataPoints.length;
      setSelectedData(newIndex);

      if (socket) {
        socket.emit("page1ToPage2", {
          selectedIndex: newIndex,
          inputData: dataPoint.features,
          targetData: getTargetValue(dataPoint.class),
          dataPoint: dataPoint,
        });
      }
    }
  };

  const handleReset = () => {
    setCurrentDataPoints([]);
    setSelectedData(null);

    if (socket) {
      socket.emit("page1ToPage2", {
        selectedIndex: null,
        inputData: [0, 0],
        targetData: 1,
        dataPoint: null,
      });
    }
  };

  // Listen for initialization request from Page 2
  useEffect(() => {
    if (socket) {
      socket.on("page2RequestData", () => {
        if (selectedData !== null && currentDataPoints[selectedData]) {
          const dataPoint = currentDataPoints[selectedData];
          socket.emit("page1ToPage2", {
            selectedIndex: selectedData,
            inputData: dataPoint.features,
            targetData: getTargetValue(dataPoint.class),
            dataPoint: dataPoint,
          });
        }
      });

      return () => {
        socket.off("page2RequestData");
      };
    }
  }, [socket, selectedData, currentDataPoints]);

  // Prepare inputs and targets for ExhiInputField component
  const inputs = currentDataPoints.map((dp) => dp.features);
  const targets = currentDataPoints.map((dp) => getTargetValue(dp.class));

  // Get available names for display
  const availableNames = dataPoints.map((dp) => dp.name).join(", ");

  return (
    <div className={tw`w-full h-screen bg-transparent`}>
      {/* Control Panel */}
      <div
        className={tw`absolute top-4 left-4 z-10 bg-white p-4 rounded-lg shadow-lg`}
      >
        <div className={tw`mb-4`}>
          <label className={tw`block text-sm font-medium mb-2`}>
            Add Data Point by Name:
          </label>
          <div className={tw`flex gap-2`}>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleAddDataPoint()}
              placeholder="Enter object name..."
              className={tw`flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm`}
            />
            <button
              onClick={handleAddDataPoint}
              className={tw`px-4 py-2 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600`}
            >
              Submit
            </button>
          </div>
        </div>

        <button
          onClick={handleReset}
          className={tw`w-full px-4 py-2 bg-red-500 text-white rounded-md text-sm hover:bg-red-600`}
        >
          Reset All
        </button>

        <div className={tw`mt-4 text-xs text-gray-600`}>
          <p>Available names: {availableNames}</p>
          <p className={tw`mt-2`}>Current points: {currentDataPoints.length}</p>
          {selectedData !== null && (
            <p>Selected: {currentDataPoints[selectedData]?.name}</p>
          )}
        </div>
      </div>

      {/* ExhiInputField occupying full screen */}
      <div className={tw`w-full h-full`}>
        <ExhiInputField
          data={{
            inputs: inputs,
            targets: targets,
            selectedData: selectedData !== null ? selectedData : 0,
            onSelect: onSelect,
            mapUnits: mapUnits,
            mapPredictions: mapPredictions,
            dataPoints: currentDataPoints,
          }}
        />
      </div>
    </div>
  );
}
