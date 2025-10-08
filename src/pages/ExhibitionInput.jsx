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
import kikiIcon from "../images/kiki-bouba/kikiIcon.jpg";
import boubaIcon from "../images/kiki-bouba/boubaIcon.jpg";

const dataPoints = [
  {
    name: "donut",
    uid: "04bd3e38c82a81",
    features: [-0.8, -0.95],
    class: "kiki",
    imgaddr: donut,
  },
  {
    name: "cube",
    uid: "04e44a38c82a81",
    features: [-0.95, -0.75],
    class: "kiki",
    imgaddr: cube,
  },
  {
    name: "mop",
    uid: "048e4a38c82a81",
    features: [-0.9, -0.85],
    class: "kiki",
    imgaddr: mop,
  },
  {
    name: "sausage",
    uid: "041d4a38c82a81",
    features: [-0.8, -0.7],
    class: "kiki",
    imgaddr: sausage,
  },
  {
    name: "ghost",
    uid: "043a4a38c82a81",
    features: [-0.7, -0.7],
    class: "kiki",
    imgaddr: ghost,
  },
  {
    name: "slime",
    uid: "04e44a38c82a81",
    features: [0.95, 0.7],
    class: "bouba",
    imgaddr: slime,
  },
  {
    name: "rock",
    uid: "046c4a38c82a81",
    features: [0.7, 0.95],
    class: "bouba",
    imgaddr: rock,
  },
  {
    name: "rainbow",
    uid: "047d4a38c82a81",
    features: [0.9, 0.8],
    class: "bouba",
    imgaddr: rainbow,
  },
  {
    name: "cloud",
    uid: "049e4a38c82a81",
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

  const getTargetValue = (className) => (className === "kiki" ? -1 : 1);

  // when RFID scanned → update UI
  useEffect(() => {
    if (!socket) return;
    socket.on("arduinoData", (msg) => {
      console.log("📡 arduinoData received:", msg);

      if (msg && msg.type === "rfid" && msg.uid) {
        console.log("🎯 RFID detected:", msg.uid);
        const uid = msg.uid.toLowerCase();
        const matched = dataPoints.find((dp) => dp.uid.toLowerCase() === uid);

        if (matched) {
          console.log("Recognized RFID:", uid, matched);
          setCurrentDataPoints((prev) => {
            const existingIdx = prev.findIndex((dp) => dp.uid === matched.uid);
            if (existingIdx >= 0) {
              setSelectedData(existingIdx);
              return prev;
            } else {
              const updated = [...prev, matched];
              setSelectedData(updated.length - 1);
              return updated;
            }
          });

          socket.emit("page1ToPage2", {
            inputData: matched.features,
            targetData: getTargetValue(matched.class),
            dataPoint: matched,
          });
        } else {
          console.warn("Unknown RFID:", uid);
        }
      } else {
        console.warn("⚠️ Invalid Arduino message:", msg);
      }
    });

    return () => socket.off("arduinoData");
  }, [socket]);

  const selectedPoint =
    selectedData !== null && currentDataPoints[selectedData]
      ? currentDataPoints[selectedData]
      : null;

  return (
    <div className={tw`w-full h-screen flex flex-row bg-gray-50`}>
      {/* LEFT PANEL — Show scanned object info */}
      <div
        className={tw`w-1/4 h-full bg-white border-r border-gray-200 p-6 flex flex-col`}
      >
        {selectedPoint ? (
          <div
            className={tw`flex-1 overflow-auto text-center bg-white rounded-xl p-6 shadow-sm border border-gray-100`}
          >
            <div className={tw`mb-6 flex justify-center`}>
              <img
                src={selectedPoint.imgaddr}
                alt={selectedPoint.name}
                className={tw`${
                  selectedPoint.class === "kiki" ? "w-1/2" : "w-full"
                } max-w-xs mx-auto`}
              />
            </div>

            <div className={tw`mb-6`}>
              <div className={tw`flex justify-between items-center mb-2`}>
                <span className={tw`text-lg font-bold text-gray-700`}>-1</span>
                <span className={tw`text-lg font-bold text-gray-700`}>1</span>
              </div>
              <div
                className={tw`w-full h-4 mb-3`}
                style={{
                  background:
                    "linear-gradient(to right, #E1504C 0%, #9C4CE1 50%, #4CC9E1 100%)",
                }}
              />
              <div className={tw`flex justify-between items-start`}>
                <div className={tw`flex flex-col items-center`}>
                  <img
                    src={kikiIcon}
                    alt="kiki"
                    className={tw`w-12 h-12 mb-1`}
                  />
                  <span className={tw`text-sm font-medium text-gray-700`}>
                    kiki
                  </span>
                </div>
                <div className={tw`flex flex-col items-center`}>
                  <img
                    src={boubaIcon}
                    alt="bouba"
                    className={tw`w-12 h-12 mb-1`}
                  />
                  <span className={tw`text-sm font-medium text-gray-700`}>
                    bouba
                  </span>
                </div>
              </div>
            </div>

            <div
              className={tw`bg-gray-50 rounded-lg p-4 border border-gray-200`}
            >
              <p className={tw`text-lg font-semibold text-gray-800 mb-2`}>
                Class:
                <span
                  className={tw`${
                    selectedPoint.class === "kiki"
                      ? "text-red-600"
                      : "text-blue-600"
                  }`}
                >
                  {" "}
                  {selectedPoint.class}
                </span>
              </p>
              <p className={tw`text-sm text-gray-600`}>
                Numeric value: {getTargetValue(selectedPoint.class)}
              </p>
            </div>
          </div>
        ) : (
          <div
            className={tw`flex-1 flex flex-col items-center justify-center text-gray-400 italic bg-white rounded-xl p-6 shadow-sm border border-gray-100`}
          >
            <div className={tw`text-sm text-center`}>
              Scan an RFID object to begin
            </div>
          </div>
        )}
      </div>

      {/* CENTER VISUALIZATION */}
      <div className={tw`flex-1 flex items-center justify-center bg-gray-50`}>
        <div className={tw`w-11/12 h-5/6`}>
          <ExhiInputField
            data={{
              inputs: currentDataPoints.map((dp) => dp.features),
              targets: currentDataPoints.map((dp) => getTargetValue(dp.class)),
              selectedData: selectedData !== null ? selectedData : -1,
              mapUnits: mapUnits,
              mapPredictions: mapPredictions,
              dataPoints: currentDataPoints,
            }}
          />
        </div>
      </div>

      {/* RIGHT FEATURE OUTPUT */}
      <div
        className={tw`w-1/5 h-full flex flex-col justify-center items-center pr-8 space-y-20`}
      >
        <div className={tw`text-center`}>
          <div className={tw`text-lg font-semibold text-gray-600 mb-2`}>
            Color
          </div>
          <div className={tw`text-6xl font-bold text-gray-800`}>
            {selectedPoint ? selectedPoint.features[0].toFixed(2) : "--"}
          </div>
        </div>
        <div className={tw`text-center`}>
          <div className={tw`text-lg font-semibold text-gray-600 mb-2`}>
            Size
          </div>
          <div className={tw`text-6xl font-bold text-gray-800`}>
            {selectedPoint ? selectedPoint.features[1].toFixed(2) : "--"}
          </div>
        </div>
      </div>
    </div>
  );
}

// // src/pages/Page1.jsx
// import React, { useState, useEffect } from "react";
// import Draggable from "react-draggable";
// import { tw } from "twind";
// import { useSocket } from "../SocketProvider.jsx";

// import ExhiInputField from "../components/ExhiInputField.jsx";
// import donut from "../images/kiki-bouba/donut.png";
// import cube from "../images/kiki-bouba/cube.png";
// import mop from "../images/kiki-bouba/mop.png";
// import sausage from "../images/kiki-bouba/sausage.png";
// import ghost from "../images/kiki-bouba/ghost.png";
// import slime from "../images/kiki-bouba/slime.png";
// import rock from "../images/kiki-bouba/rock.png";
// import rainbow from "../images/kiki-bouba/rainbow.png";
// import cloud from "../images/kiki-bouba/cloud.png";
// import kikiIcon from "../images/kiki-bouba/kikiIcon.jpg";
// import boubaIcon from "../images/kiki-bouba/boubaIcon.jpg";

// const dataPoints = [
//   {
//     name: "donut",
//     uid: "04 BD 3E 38 C8 2A 81",
//     features: [-0.8, -0.95],
//     class: "kiki",
//     imgaddr: donut,
//   },
//   {
//     name: "cube",
//     uid: "04 E4 4A 38 C8 2A 81",
//     features: [-0.95, -0.75],
//     class: "kiki",
//     imgaddr: cube,
//   },
//   {
//     name: "mop",
//     uid: "04 8E 4A 38 C8 2A 81",
//     features: [-0.9, -0.85],
//     class: "kiki",
//     imgaddr: mop,
//   },
//   {
//     name: "sausage",
//     uid: "04 1D 4A 38 C8 2A 81",
//     features: [-0.8, -0.7],
//     class: "kiki",
//     imgaddr: sausage,
//   },
//   {
//     name: "ghost",
//     uid: "04 3A 4A 38 C8 2A 81",
//     features: [-0.7, -0.7],
//     class: "kiki",
//     imgaddr: ghost,
//   },
//   {
//     name: "slime",
//     uid: "04 E4 4A 38 C8 2A 81",
//     features: [0.95, 0.7],
//     class: "bouba",
//     imgaddr: slime,
//   },
//   {
//     name: "rock",
//     uid: "04 6C 4A 38 C8 2A 81",
//     features: [0.7, 0.95],
//     class: "bouba",
//     imgaddr: rock,
//   },
//   {
//     name: "rainbow",
//     uid: "04 7D 4A 38 C8 2A 81",
//     features: [0.9, 0.8],
//     class: "bouba",
//     imgaddr: rainbow,
//   },
//   {
//     name: "cloud",
//     uid: "04 9E 4A 38 C8 2A 81",
//     features: [0.85, 0.9],
//     class: "bouba",
//     imgaddr: cloud,
//   },
// ];

// export default function Page1() {
//   const socket = useSocket();

//   const [currentDataPoints, setCurrentDataPoints] = useState([]);
//   const [selectedData, setSelectedData] = useState(null);
//   const [mapUnits, setMapUnits] = useState(20);
//   const [mapPredictions, setMapPredictions] = useState([[]]);
//   const [searchInput, setSearchInput] = useState("");

//   const getTargetValue = (className) => (className === "kiki" ? -1 : 1);

//   const onSelect = (idx) => {
//     setSelectedData(idx);
//     if (socket && currentDataPoints[idx]) {
//       const dataPoint = currentDataPoints[idx];
//       socket.emit("page1ToPage2", {
//         selectedIndex: idx,
//         inputData: dataPoint.features,
//         targetData: getTargetValue(dataPoint.class),
//         dataPoint: dataPoint,
//       });
//     }
//   };

//   const handleAddDataPoint = () => {
//     const name = searchInput.trim().toLowerCase();
//     const dataPoint = dataPoints.find((dp) => dp.name.toLowerCase() === name);

//     if (dataPoint) {
//       // Check if data point already exists in currentDataPoints
//       const existingIndex = currentDataPoints.findIndex(
//         (dp) => dp.name === dataPoint.name
//       );

//       if (existingIndex >= 0) {
//         // Data point already exists - select the existing one
//         setSelectedData(existingIndex);
//         if (socket) {
//           socket.emit("page1ToPage2", {
//             selectedIndex: existingIndex,
//             inputData: dataPoint.features,
//             targetData: getTargetValue(dataPoint.class),
//             dataPoint: dataPoint,
//           });
//         }
//       } else {
//         // Data point doesn't exist - add it
//         setCurrentDataPoints((prev) => [...prev, dataPoint]);
//         const newIndex = currentDataPoints.length;
//         setSelectedData(newIndex);
//         if (socket) {
//           socket.emit("page1ToPage2", {
//             selectedIndex: newIndex,
//             inputData: dataPoint.features,
//             targetData: getTargetValue(dataPoint.class),
//             dataPoint: dataPoint,
//           });
//         }
//       }
//       setSearchInput("");
//     }
//   };

//   const handleReset = () => {
//     setCurrentDataPoints([]);
//     setSelectedData(null);
//     if (socket) {
//       socket.emit("page1ToPage2", {
//         selectedIndex: null,
//         inputData: [0, 0],
//         targetData: 1,
//         dataPoint: null,
//       });
//     }
//   };

//   useEffect(() => {
//     if (socket) {
//       socket.on("page2RequestData", () => {
//         if (selectedData !== null && currentDataPoints[selectedData]) {
//           const dataPoint = currentDataPoints[selectedData];
//           socket.emit("page1ToPage2", {
//             selectedIndex: selectedData,
//             inputData: dataPoint.features,
//             targetData: getTargetValue(dataPoint.class),
//             dataPoint: dataPoint,
//           });
//         }
//       });
//       return () => socket.off("page2RequestData");
//     }
//   }, [socket, selectedData, currentDataPoints]);

//   const inputs = currentDataPoints.map((dp) => dp.features);
//   const targets = currentDataPoints.map((dp) => getTargetValue(dp.class));
//   const availableNames = dataPoints.map((dp) => dp.name).join(", ");

//   const selectedPoint =
//     selectedData !== null && currentDataPoints[selectedData]
//       ? currentDataPoints[selectedData]
//       : null;

//   return (
//     <div className={tw`w-full h-screen flex flex-row bg-gray-50`}>
//       {/* ========== LEFT PANEL ========== */}
//       <div
//         className={tw`w-1/4 h-full bg-white border-r border-gray-200 p-6 flex flex-col`}
//       >
//         {/* Control Panel */}
//         <div
//           className={tw`bg-blue-50 rounded-xl shadow-sm border border-blue-100`}
//         >
//           <div className={tw`flex gap-2 mb-4`}>
//             <input
//               type="text"
//               value={searchInput}
//               onChange={(e) => setSearchInput(e.target.value)}
//               onKeyPress={(e) => e.key === "Enter" && handleAddDataPoint()}
//               placeholder="Enter object name..."
//               className={tw`flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
//             />
//             <button
//               onClick={handleAddDataPoint}
//               className={tw`px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors`}
//             >
//               Add
//             </button>
//           </div>
//         </div>

//         {/* Selected Profile */}
//         {selectedPoint ? (
//           <div
//             className={tw`flex-1 overflow-auto text-center bg-white rounded-xl p-6 shadow-sm border border-gray-100 mt-4`}
//           >
//             {/* <h2
//               className={tw`font-bold text-2xl text-gray-800 mb-4 capitalize`}
//             >
//               {selectedPoint.name}
//             </h2> */}

//             {/* Image with conditional sizing */}
//             <div className={tw`mb-6 flex justify-center`}>
//               <img
//                 src={selectedPoint.imgaddr}
//                 alt={selectedPoint.name}
//                 className={tw`${
//                   selectedPoint.class === "kiki" ? "w-1/2" : "w-full"
//                 } max-w-xs mx-auto`}
//               />
//             </div>

//             {/* Class Mapping Visualization */}
//             <div className={tw`mb-6`}>
//               <div className={tw`flex justify-between items-center mb-2`}>
//                 <span className={tw`text-lg font-bold text-gray-700`}>-1</span>
//                 <span className={tw`text-lg font-bold text-gray-700`}>1</span>
//               </div>

//               <div
//                 className={tw`w-full h-4 mb-3`}
//                 style={{
//                   background:
//                     "linear-gradient(to right, #e1674cff 0%, #E1504C 15%, #9c4CE1 50%, #4C6EE1 75%, #4CC9E1 100%)",
//                 }}
//               />

//               <div className={tw`flex justify-between items-start`}>
//                 <div className={tw`flex flex-col items-center`}>
//                   <img
//                     src={kikiIcon}
//                     alt="kiki"
//                     className={tw`w-12 h-12 mb-1`}
//                   />
//                   <span className={tw`text-sm font-medium text-gray-700`}>
//                     kiki
//                   </span>
//                 </div>
//                 <div className={tw`flex flex-col items-center`}>
//                   <img
//                     src={boubaIcon}
//                     alt="bouba"
//                     className={tw`w-12 h-12 mb-1`}
//                   />
//                   <span className={tw`text-sm font-medium text-gray-700`}>
//                     bouba
//                   </span>
//                 </div>
//               </div>
//             </div>

//             {/* Class Information */}
//             <div
//               className={tw`bg-gray-50 rounded-lg p-4 border border-gray-200`}
//             >
//               <p className={tw`text-lg font-semibold text-gray-800 mb-2`}>
//                 Class:{" "}
//                 <span
//                   className={tw`${
//                     selectedPoint.class === "kiki"
//                       ? "text-red-600"
//                       : "text-blue-600"
//                   }`}
//                 >
//                   {selectedPoint.class}
//                 </span>
//               </p>
//               <p className={tw`text-sm text-gray-600`}>
//                 Numeric value: {getTargetValue(selectedPoint.class)}
//               </p>
//             </div>
//           </div>
//         ) : (
//           <div
//             className={tw`flex-1 flex flex-col items-center justify-center text-gray-400 italic bg-white rounded-xl p-6 shadow-sm border border-gray-100 mt-4`}
//           >
//             {/* <div className={tw`text-xl mb-4`}>No data point entered</div> */}
//             <div className={tw`text-sm text-center`}>
//               Try placing one object on the reader
//             </div>
//           </div>
//         )}
//       </div>

//       {/* ========== CENTER VISUALIZATION ========== */}
//       <div className={tw`flex-1 flex items-center justify-center bg-gray-50`}>
//         <div className={tw`w-11/12 h-5/6`}>
//           <ExhiInputField
//             data={{
//               inputs: inputs,
//               targets: targets,
//               selectedData: selectedData !== null ? selectedData : -1,
//               onSelect: onSelect,
//               mapUnits: mapUnits,
//               mapPredictions: mapPredictions,
//               dataPoints: currentDataPoints,
//             }}
//           />
//         </div>
//       </div>

//       {/* ========== RIGHT FEATURE OUTPUTS ========== */}
//       <div
//         className={tw`w-1/5 h-full flex flex-col justify-center items-center pr-8 space-y-20`}
//       >
//         <div className={tw`text-center`}>
//           <div className={tw`text-lg font-semibold text-gray-600 mb-2`}>
//             Color
//           </div>
//           <div className={tw`text-6xl font-bold text-gray-800`}>
//             {selectedPoint ? selectedPoint.features[0].toFixed(2) : "--"}
//           </div>
//         </div>
//         <div className={tw`text-center`}>
//           <div className={tw`text-lg font-semibold text-gray-600 mb-2`}>
//             Size
//           </div>
//           <div className={tw`text-6xl font-bold text-gray-800`}>
//             {selectedPoint ? selectedPoint.features[1].toFixed(2) : "--"}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
