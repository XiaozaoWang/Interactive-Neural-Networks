// src/pages/Page2.jsx
import React, { useEffect, useState, useCallback } from "react";
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  ReactFlowProvider,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { mean_squared_error, MLP, Value } from "../micrograd.js";
import { tw } from "twind";

import DragNode from "../components/DragNode.jsx";
import SliderNode from "../components/SliderNode.jsx";
import BlackBox from "../components/BlackBox.jsx";
import GraphNode from "../components/GraphNode.jsx";
import FaceNode from "../components/FaceNode.jsx";
import SumNode from "../components/SumNode.jsx";
import BiasNode from "../components/BiasNode.jsx";

import TextNode from "../components/TextNode.jsx";
import FormulaNode from "../components/FormulaNode.jsx";

import ButtonNode from "../components/ButtonNode.jsx";
import LrNode from "../components/LrNode.jsx";

import ParamEdge from "../components/ParamEdge.jsx";
import NormalEdge from "../components/NormalEdge.jsx";

import { useSocket } from "../SocketProvider.jsx";

const nodeTypes = {
  DragNode: DragNode,
  SliderNode: SliderNode,
  BlackBox: BlackBox,
  TextNode: TextNode,
  GraphNode: GraphNode,
  ButtonNode: ButtonNode,
  FaceNode: FaceNode,
  SumNode: SumNode,
  BiasNode: BiasNode,
  LrNode: LrNode,
  FormulaNode: FormulaNode,
};

const edgeTypes = {
  ParamEdge: ParamEdge,
  NormalEdge: NormalEdge,
};

export default function ExhibitionNN() {
  const datumX = 100;
  const datumY = 50;
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const socket = useSocket();

  const onConnect = useCallback(
    (connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges]
  );

  const [selectedData, setSelectedData] = useState(0);
  const [inputs, setInputs] = useState([0, 0]); // Will be updated from Page 1
  const [target, setTarget] = useState(1); // Will be updated from Page 1
  const [comingData, setComingData] = useState(null);
  const [comingIdx, setComingIdx] = useState(null);
  const [glowingEle, setGlowingEle] = useState([]);
  const [formulaOn, setFormulaOn] = useState(false);
  const [clickedGrad, setClickedGrad] = useState(null);

  // activation functions
  function tanh(x) {
    return (Math.exp(2 * x) - 1) / (Math.exp(2 * x) + 1);
  }

  //prediction map
  const [mapUnits, setMapUnits] = useState(20);
  const [mapArray, setMapArray] = useState(initMapArray());
  function initMapArray() {
    const mapArray = [];
    for (let i = -1; i < 1; i += 2 / mapUnits) {
      const row = [];
      for (let j = 1; j > -1; j -= 2 / mapUnits) {
        row.push([i, j]);
      }
      mapArray.push(row);
    }
    return mapArray;
  }
  const [mapPredictions, setMapPredictions] = useState([[]]);

  // backend neural network
  const [inOutNN, setInOutNN] = useState(new MLP(2, [1]));
  const [prediction, setPrediction] = useState(-1);
  const [loss, setLoss] = useState(new Value(0));
  const [nnData, setNnData] = useState([]);
  const [prevNNData, setPrevNNData] = useState(null);
  const weightStep = 0.1;

  const handleFeed = (inputData, targetValue) => {
    const pred = inOutNN.forward(inputData);
    setPrediction(pred.data.toFixed(2));

    const predArr = [pred];
    const targetArr = [targetValue];
    const loss = mean_squared_error(targetArr, predArr);
    setLoss(loss);

    // Send prediction to Page 3
    if (socket) {
      socket.emit("page2ToPage3", {
        prediction: pred.data.toFixed(2),
        target: targetValue,
        inputData: inputData,
      });
    }

    // update the prediction map
    const mapPred = mapArray.map((row) =>
      row.map((point) => {
        const pred = inOutNN.forward(point);
        return pred.data.toFixed(1);
      })
    );
    setMapPredictions(mapPred);
  };

  // const handleStep = () => {
  //   setPrevNNData(nnData);
  //   handleFeed(inputs, target);

  //   for (let p of inOutNN.parameters()) {
  //     p.grad = 0.0;
  //   }
  //   loss.backward();

  //   for (let p of inOutNN.parameters()) {
  //     p.data += -1 * p.grad * 0.05;
  //   }

  //   setNnData(updateNodeData());
  // };

  const handleStep = () => {
    setPrevNNData(nnData);
    handleFeed(inputs, target);

    // Reset gradients
    for (let p of inOutNN.parameters()) {
      p.grad = 0.0;
    }

    // Compute gradients
    loss.backward();

    // Collect gradients before updating parameters
    const gradients = [];
    for (let p of inOutNN.parameters()) {
      gradients.push({
        value: p.data,
        grad: p.grad,
      });
    }

    // Update parameters
    for (let p of inOutNN.parameters()) {
      p.data += -1 * p.grad * 0.05;
    }

    setNnData(updateNodeData());

    // Send gradients to Page 3 via socket
    if (socket) {
      socket.emit("gradientsUpdate", {
        gradients: gradients,
        weights: [
          inOutNN.layers[0].neurons[0].w[0].data,
          inOutNN.layers[0].neurons[0].w[1].data,
        ],
        bias: inOutNN.layers[0].neurons[0].b.data,
      });
    }
  };

  const handleTrain = () => {
    // Training logic here if needed
  };

  // 新增：增加特定edge权重的函数
  const increaseN11W1Weight = () => {
    const edgeId = "n11w1";
    onWeightIncrease(edgeId);
  };

  // useEffect(() => {
  //   if (socket) {
  //     socket.on("page1ToPage2", (data) => {
  //       setSelectedData(data.selectedIndex);
  //       setInputs(data.inputData);
  //       setTarget(data.targetData);
  //       handleFeed(data.inputData, data.targetData);
  //     });

  //     // Request initial data from Page 1
  //     // socket.emit("page2RequestData");

  //     return () => {
  //       socket.off("page1ToPage2");
  //       socket.off("trainOnce"); // ADD THIS: Clean up the listener
  //     };
  //   }
  // }, [socket]);

  useEffect(() => {
    if (!socket) return;

    const handleArduinoData = (data) => {
      if (data.type === "slider") {
        const { id, value } = data;
        // map 0–680 → -1 to 1
        const mapped = (value / 680) * 2 - 1;

        console.log(
          `🎚️ Slider ${id}: raw=${value} → mapped=${mapped.toFixed(2)}`
        );

        // Apply slider to corresponding parameter
        if (id === 1) {
          // weight1
          inOutNN.layers[0].neurons[0].w[0].data = mapped;
        } else if (id === 2) {
          // weight2
          inOutNN.layers[0].neurons[0].w[1].data = mapped;
        } else if (id === 3) {
          // bias
          inOutNN.layers[0].neurons[0].b.data = mapped;
        }

        // Update UI
        setNnData(updateNodeData());
        handleFeed(inputs, target);
      } else if (data.type === "button" && data.state === "pressed") {
        console.log("🟩 Physical TRAIN button pressed!");
        handleStep(); // trigger training step
      }
    };

    socket.on("arduinoData", handleArduinoData);
    socket.on("page1ToPage2", (data) => {
      setSelectedData(data.selectedIndex);
      setInputs(data.inputData);
      setTarget(data.targetData);
      handleFeed(data.inputData, data.targetData);
    });

    return () => {
      socket.off("arduinoData", handleArduinoData);
      socket.off("page1ToPage2");
    };
  }, [socket, inOutNN, inputs, target]);

  // Initialization
  useEffect(() => {
    setNnData(updateNodeData());
    handleFeed(inputs, target);
  }, []);

  function updateNodeData() {
    const layers = inOutNN.layers.map((layer) =>
      layer.neurons.map((neuron) => ({
        weights: neuron.w.map((w) => w.data),
        bias: neuron.b.data,
        output: neuron.out.data,
        gradw: neuron.w.map((w) => w.grad),
        gradb: neuron.b.grad,
      }))
    );
    const updatedData = { size: inOutNN.sz, layers: layers };
    return updatedData;
  }

  // Update nodes and edges when data changes
  useEffect(() => {
    const newNodes = [
      {
        id: "i1",
        data: {
          value: inputs[0],
          selectedData: selectedData,
          glowingEle: glowingEle,
          onValueChange: onValueChange,
          text: "Size",
          draggable: false,
        },
        position: {
          x: datumX + 300,
          y: datumY,
        },
        type: "SliderNode",
        draggable: false,
      },
      {
        id: "i2",
        data: {
          value: inputs[1],
          selectedData: selectedData,
          glowingEle: glowingEle,
          onValueChange: onValueChange,
          text: "Color",
          draggable: false,
        },
        position: {
          x: datumX + 300,
          y: datumY + 170,
        },
        type: "SliderNode",
        draggable: false,
      },
      {
        id: "dumb",
        position: {
          x: datumX + 300,
          y: datumY + 350,
        },
        type: "BiasNode",
        draggable: false,
      },
      {
        id: "n11s",
        data: {
          sum: inOutNN.layers[0].neurons[0].sum.data,
          inputs: inputs,
          weights: inOutNN.layers[0].neurons[0].w.map((w) => w.data),
          bias: inOutNN.layers[0].neurons[0].b.data,
          size: { w: 30, h: 130 },
          glowingEle: glowingEle,
          onBiasChange: onBiasChange,
          onParamHover: onParamHover,
        },
        position: {
          x: datumX + 510,
          y: datumY + 90,
        },
        type: "SumNode",
        draggable: false,
      },
      {
        id: "n11a",
        data: {
          input: inOutNN.layers[0].neurons[0].sum.data,
          output: inOutNN.layers[0].neurons[0].out.data,
          func: tanh,
          glowingEle: glowingEle,
          text: "Activation",
          draggable: false,
        },
        position: {
          x: datumX + 570,
          y: datumY + 80,
        },
        type: "GraphNode",
        draggable: false,
      },
      {
        id: "prediction",
        data: {
          value: Number(prediction),
          target: target,
          onValueChange: onValueChange,
          glowingEle: glowingEle,
          text: "Prediction",
        },
        position: {
          x: datumX + 800,
          y: datumY + 80,
        },
        type: "SliderNode",
        draggable: false,
      },
      {
        id: "loss",
        data: {
          value: loss.data / 2,
          onValueChange: onValueChange,
          glowingEle: glowingEle,
          text: "Loss",
          grayscale: 50,
        },
        position: {
          x: datumX + 950,
          y: datumY + 80,
        },
        type: "SliderNode",
        draggable: false,
      },
      {
        id: "formula",
        data: {
          onParamHover: onParamHover,
          formulaOn: formulaOn,
          clickedGrad: clickedGrad,
        },
        position: {
          x: datumX + 260,
          y: 50,
        },
        type: "FormulaNode",
        draggable: false,
      },
    ];

    const newEdges = [
      {
        id: "n11w1",
        source: "i1",
        target: "n11s",
        type: "ParamEdge",
        data: {
          nnData: nnData,
          value: inOutNN.layers[0].neurons[0].w[0].data.toFixed(2),
          isHovered: false,
          isClicked: false,
          glowingEle: glowingEle,
          onGradArrowClick: onGradArrowClick,
          clickedGrad: clickedGrad,
          showLabel: true,
          onWeightIncrease: onWeightIncrease,
          onWeightDecrease: onWeightDecrease,
        },
      },
      {
        id: "n11w2",
        source: "i2",
        target: "n11s",
        type: "ParamEdge",
        data: {
          nnData: nnData,
          value: inOutNN.layers[0].neurons[0].w[1].data.toFixed(2),
          isHovered: false,
          isClicked: false,
          glowingEle: glowingEle,
          onGradArrowClick: onGradArrowClick,
          clickedGrad: clickedGrad,
          showLabel: true,
          onWeightIncrease: onWeightIncrease,
          onWeightDecrease: onWeightDecrease,
        },
      },
      {
        id: "n11b",
        source: "dumb",
        target: "n11s",
        type: "ParamEdge",
        data: {
          nnData: nnData,
          value: inOutNN.layers[0].neurons[0].b.data.toFixed(2),
          isHovered: false,
          isClicked: false,
          glowingEle: glowingEle,
          onGradArrowClick: onGradArrowClick,
          clickedGrad: clickedGrad,
          showLabel: true,
          onWeightIncrease: onWeightIncrease,
          onWeightDecrease: onWeightDecrease,
        },
      },
      {
        id: "s-a",
        source: "n11s",
        target: "n11a",
        animated: true,
        type: "NormalEdge",
      },
      {
        id: "a-p",
        source: "n11a",
        target: "prediction",
        animated: false,
        type: "NormalEdge",
      },
      {
        id: "p-l",
        source: "prediction",
        target: "loss",
        animated: false,
        type: "NormalEdge",
      },
    ];

    setNodes(newNodes);
    setEdges(newEdges);
  }, [
    selectedData,
    inputs,
    target,
    prediction,
    nnData,
    mapPredictions,
    glowingEle,
    formulaOn,
    clickedGrad,
    loss,
  ]);

  const onValueChange = (i, v) => {
    setComingData(v);
    setComingIdx(i);
  };

  const onBiasChange = (v) => {
    console.log("onBiasChange: ", v);
  };

  const onEdgeMouseEnter = (event, edge) => {
    const edgeId = edge.id;
    setEdges((prevElements) =>
      prevElements.map((element) =>
        element.id === edgeId
          ? {
              ...element,
              data: {
                ...element.data,
                isHovered: true,
              },
            }
          : element
      )
    );
  };

  const onEdgeMouseLeave = (event, edge) => {
    const edgeId = edge.id;
    setEdges((prevElements) =>
      prevElements.map((element) =>
        element.id === edgeId
          ? {
              ...element,
              data: {
                ...element.data,
                isHovered: false,
              },
            }
          : element
      )
    );
  };

  const onGradArrowClick = (id) => {
    console.log("grad clicked", id);
    setClickedGrad(id);
  };

  const onWeightIncrease = (id) => {
    let param;
    if (id.includes("w")) {
      param = inOutNN.layers[id[1] - 1].neurons[id[2] - 1].w[id[4] - 1];
    } else if (id.includes("b")) {
      param = inOutNN.layers[id[1] - 1].neurons[id[2] - 1].b;
    }
    param.data += weightStep;
    if (param.data > 1) {
      param.data = 1;
    }

    setNnData(updateNodeData());
    handleFeed(inputs, target);
  };

  const onWeightDecrease = (id) => {
    let param;
    if (id.includes("w")) {
      param = inOutNN.layers[id[1] - 1].neurons[id[2] - 1].w[id[4] - 1];
    } else if (id.includes("b")) {
      param = inOutNN.layers[id[1] - 1].neurons[id[2] - 1].b;
    }
    param.data -= weightStep;
    if (param.data < -1) {
      param.data = -1;
    }
    setNnData(updateNodeData());
    handleFeed(inputs, target);
  };

  const onParamHover = (id) => {
    if (id === "grad0") {
      setGlowingEle(["loss", "p-l", "prediction", "a-p", "n11a"]);
    } else if (id === "grad1") {
      setGlowingEle(["n11a", "n11s"]);
    } else if (id === "grad2") {
      setGlowingEle(["n11s", clickedGrad]);
    } else {
      setGlowingEle([id]);
    }
  };

  return (
    <>
      <ReactFlowProvider>
        {/* 新增：页面顶部的控制按钮 */}
        <div
          style={{
            padding: "10px",
            backgroundColor: "#f5f5f5",
            borderBottom: "1px solid #ddd",
            marginBottom: "10px",
          }}
        >
          <button
            onClick={handleStep}
            style={{
              padding: "8px 16px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "bold",
            }}
            onMouseOver={(e) => (e.target.style.backgroundColor = "#0056b3")}
            onMouseOut={(e) => (e.target.style.backgroundColor = "#007bff")}
          >
            Train
          </button>
        </div>

        <div style={{ width: "100%", height: "90vh" }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onEdgeMouseEnter={onEdgeMouseEnter}
            onEdgeMouseLeave={onEdgeMouseLeave}
            onConnect={onConnect}
            panOnDrag={false}
            zoomOnScroll={false}
            zoomOnDoubleClick={false}
          >
            <Background bgColor="#fafafa" variant={false} />
          </ReactFlow>
        </div>
      </ReactFlowProvider>
    </>
  );
}

// =============================================================================

// // src/pages/Page2.jsx
// import React, { useEffect, useState, useCallback } from "react";
// import {
//   ReactFlow,
//   Controls,
//   Background,
//   useNodesState,
//   useEdgesState,
//   applyNodeChanges,
//   applyEdgeChanges,
//   addEdge,
//   ReactFlowProvider,
// } from "@xyflow/react";
// import "@xyflow/react/dist/style.css";
// import { mean_squared_error, MLP, Value } from "../micrograd.js";
// import { tw } from "twind";

// import DragNode from "../components/DragNode.jsx";
// import SliderNode from "../components/SliderNode.jsx";
// import BlackBox from "../components/BlackBox.jsx";
// import GraphNode from "../components/GraphNode.jsx";
// import FaceNode from "../components/FaceNode.jsx";
// import SumNode from "../components/SumNode.jsx";
// import BiasNode from "../components/BiasNode.jsx";

// import TextNode from "../components/TextNode.jsx";
// import FormulaNode from "../components/FormulaNode.jsx";

// import ButtonNode from "../components/ButtonNode.jsx";
// import LrNode from "../components/LrNode.jsx";

// import ParamEdge from "../components/ParamEdge.jsx";
// import NormalEdge from "../components/NormalEdge.jsx";

// import { useSocket } from "../SocketProvider.jsx";

// const nodeTypes = {
//   DragNode: DragNode,
//   SliderNode: SliderNode,
//   BlackBox: BlackBox,
//   TextNode: TextNode,
//   GraphNode: GraphNode,
//   ButtonNode: ButtonNode,
//   FaceNode: FaceNode,
//   SumNode: SumNode,
//   BiasNode: BiasNode,
//   LrNode: LrNode,
//   FormulaNode: FormulaNode,
// };

// const edgeTypes = {
//   ParamEdge: ParamEdge,
//   NormalEdge: NormalEdge,
// };

// export default function ExhibitionNN() {
//   const datumX = 100;
//   const datumY = 50;
//   const [nodes, setNodes, onNodesChange] = useNodesState([]);
//   const [edges, setEdges, onEdgesChange] = useEdgesState([]);

//   const socket = useSocket();

//   const onConnect = useCallback(
//     (connection) => setEdges((eds) => addEdge(connection, eds)),
//     [setEdges]
//   );

//   const [selectedData, setSelectedData] = useState(0);
//   const [inputs, setInputs] = useState([0, 0]); // Will be updated from Page 1
//   const [target, setTarget] = useState(1); // Will be updated from Page 1
//   const [comingData, setComingData] = useState(null);
//   const [comingIdx, setComingIdx] = useState(null);
//   const [glowingEle, setGlowingEle] = useState([]);
//   const [formulaOn, setFormulaOn] = useState(false);
//   const [clickedGrad, setClickedGrad] = useState(null);

//   // activation functions
//   function tanh(x) {
//     return (Math.exp(2 * x) - 1) / (Math.exp(2 * x) + 1);
//   }

//   //prediction map
//   const [mapUnits, setMapUnits] = useState(20);
//   const [mapArray, setMapArray] = useState(initMapArray());
//   function initMapArray() {
//     const mapArray = [];
//     for (let i = -1; i < 1; i += 2 / mapUnits) {
//       const row = [];
//       for (let j = 1; j > -1; j -= 2 / mapUnits) {
//         row.push([i, j]);
//       }
//       mapArray.push(row);
//     }
//     return mapArray;
//   }
//   const [mapPredictions, setMapPredictions] = useState([[]]);

//   // backend neural network
//   const [inOutNN, setInOutNN] = useState(new MLP(2, [1]));
//   const [prediction, setPrediction] = useState(-1);
//   const [loss, setLoss] = useState(new Value(0));
//   const [nnData, setNnData] = useState([]);
//   const [prevNNData, setPrevNNData] = useState(null);
//   const weightStep = 0.1;

//   const handleFeed = (inputData, targetValue) => {
//     const pred = inOutNN.forward(inputData);
//     setPrediction(pred.data.toFixed(2));

//     const predArr = [pred];
//     const targetArr = [targetValue];
//     const loss = mean_squared_error(targetArr, predArr);
//     setLoss(loss);

//     // Send prediction to Page 3
//     if (socket) {
//       socket.emit("page2ToPage3", {
//         prediction: pred.data.toFixed(2),
//         target: targetValue,
//         inputData: inputData,
//       });
//     }

//     // update the prediction map
//     const mapPred = mapArray.map((row) =>
//       row.map((point) => {
//         const pred = inOutNN.forward(point);
//         return pred.data.toFixed(1);
//       })
//     );
//     setMapPredictions(mapPred);
//   };

//   const handleStep = () => {
//     setPrevNNData(nnData);
//     handleFeed(inputs, target);

//     for (let p of inOutNN.parameters()) {
//       p.grad = 0.0;
//     }
//     loss.backward();

//     for (let p of inOutNN.parameters()) {
//       p.data += -1 * p.grad * 0.05;
//     }

//     setNnData(updateNodeData());
//   };

//   const handleTrain = () => {
//     // Training logic here if needed
//   };

//   // Listen for data from Page 1
//   useEffect(() => {
//     if (socket) {
//       socket.on("page1ToPage2", (data) => {
//         setSelectedData(data.selectedIndex);
//         setInputs(data.inputData);
//         setTarget(data.targetData);
//         handleFeed(data.inputData, data.targetData);
//       });

//       // Request initial data from Page 1
//       socket.emit("page2RequestData");

//       return () => {
//         socket.off("page1ToPage2");
//       };
//     }
//   }, [socket]);

//   // Initialization
//   useEffect(() => {
//     setNnData(updateNodeData());
//     handleFeed(inputs, target);
//   }, []);

//   function updateNodeData() {
//     const layers = inOutNN.layers.map((layer) =>
//       layer.neurons.map((neuron) => ({
//         weights: neuron.w.map((w) => w.data),
//         bias: neuron.b.data,
//         output: neuron.out.data,
//         gradw: neuron.w.map((w) => w.grad),
//         gradb: neuron.b.grad,
//       }))
//     );
//     const updatedData = { size: inOutNN.sz, layers: layers };
//     return updatedData;
//   }

//   // Update nodes and edges when data changes
//   useEffect(() => {
//     const newNodes = [
//       {
//         id: "i1",
//         data: {
//           value: inputs[0],
//           selectedData: selectedData,
//           glowingEle: glowingEle,
//           onValueChange: onValueChange,
//           text: "Size",
//           draggable: false,
//         },
//         position: {
//           x: datumX + 300,
//           y: datumY,
//         },
//         type: "SliderNode",
//         draggable: false,
//       },
//       {
//         id: "i2",
//         data: {
//           value: inputs[1],
//           selectedData: selectedData,
//           glowingEle: glowingEle,
//           onValueChange: onValueChange,
//           text: "Color",
//           draggable: false,
//         },
//         position: {
//           x: datumX + 300,
//           y: datumY + 170,
//         },
//         type: "SliderNode",
//         draggable: false,
//       },
//       {
//         id: "dumb",
//         position: {
//           x: datumX + 300,
//           y: datumY + 350,
//         },
//         type: "BiasNode",
//         draggable: false,
//       },
//       {
//         id: "n11s",
//         data: {
//           sum: inOutNN.layers[0].neurons[0].sum.data,
//           inputs: inputs,
//           weights: inOutNN.layers[0].neurons[0].w.map((w) => w.data),
//           bias: inOutNN.layers[0].neurons[0].b.data,
//           size: { w: 30, h: 130 },
//           glowingEle: glowingEle,
//           onBiasChange: onBiasChange,
//           onParamHover: onParamHover,
//         },
//         position: {
//           x: datumX + 510,
//           y: datumY + 90,
//         },
//         type: "SumNode",
//         draggable: false,
//       },
//       {
//         id: "n11a",
//         data: {
//           input: inOutNN.layers[0].neurons[0].sum.data,
//           output: inOutNN.layers[0].neurons[0].out.data,
//           func: tanh,
//           glowingEle: glowingEle,
//           text: "Activation",
//           draggable: false,
//         },
//         position: {
//           x: datumX + 570,
//           y: datumY + 80,
//         },
//         type: "GraphNode",
//         draggable: false,
//       },
//       {
//         id: "prediction",
//         data: {
//           value: Number(prediction),
//           target: target,
//           onValueChange: onValueChange,
//           glowingEle: glowingEle,
//           text: "Prediction",
//         },
//         position: {
//           x: datumX + 800,
//           y: datumY + 80,
//         },
//         type: "SliderNode",
//         draggable: false,
//       },
//       {
//         id: "loss",
//         data: {
//           value: loss.data / 2,
//           onValueChange: onValueChange,
//           glowingEle: glowingEle,
//           text: "Loss",
//           grayscale: 50,
//         },
//         position: {
//           x: datumX + 950,
//           y: datumY + 80,
//         },
//         type: "SliderNode",
//         draggable: false,
//       },
//       {
//         id: "formula",
//         data: {
//           onParamHover: onParamHover,
//           formulaOn: formulaOn,
//           clickedGrad: clickedGrad,
//         },
//         position: {
//           x: datumX + 260,
//           y: 50,
//         },
//         type: "FormulaNode",
//         draggable: false,
//       },
//     ];

//     const newEdges = [
//       {
//         id: "n11w1",
//         source: "i1",
//         target: "n11s",
//         type: "ParamEdge",
//         data: {
//           nnData: nnData,
//           value: inOutNN.layers[0].neurons[0].w[0].data.toFixed(2),
//           isHovered: false,
//           isClicked: false,
//           glowingEle: glowingEle,
//           onGradArrowClick: onGradArrowClick,
//           clickedGrad: clickedGrad,
//           showLabel: true,
//           onWeightIncrease: onWeightIncrease,
//           onWeightDecrease: onWeightDecrease,
//         },
//       },
//       {
//         id: "n11w2",
//         source: "i2",
//         target: "n11s",
//         type: "ParamEdge",
//         data: {
//           nnData: nnData,
//           value: inOutNN.layers[0].neurons[0].w[1].data.toFixed(2),
//           isHovered: false,
//           isClicked: false,
//           glowingEle: glowingEle,
//           onGradArrowClick: onGradArrowClick,
//           clickedGrad: clickedGrad,
//           showLabel: true,
//           onWeightIncrease: onWeightIncrease,
//           onWeightDecrease: onWeightDecrease,
//         },
//       },
//       {
//         id: "n11b",
//         source: "dumb",
//         target: "n11s",
//         type: "ParamEdge",
//         data: {
//           nnData: nnData,
//           value: inOutNN.layers[0].neurons[0].b.data.toFixed(2),
//           isHovered: false,
//           isClicked: false,
//           glowingEle: glowingEle,
//           onGradArrowClick: onGradArrowClick,
//           clickedGrad: clickedGrad,
//           showLabel: true,
//           onWeightIncrease: onWeightIncrease,
//           onWeightDecrease: onWeightDecrease,
//         },
//       },
//       {
//         id: "s-a",
//         source: "n11s",
//         target: "n11a",
//         animated: true,
//         type: "NormalEdge",
//       },
//       {
//         id: "a-p",
//         source: "n11a",
//         target: "prediction",
//         animated: false,
//         type: "NormalEdge",
//       },
//       {
//         id: "p-l",
//         source: "prediction",
//         target: "loss",
//         animated: false,
//         type: "NormalEdge",
//       },
//     ];

//     setNodes(newNodes);
//     setEdges(newEdges);
//   }, [
//     selectedData,
//     inputs,
//     target,
//     prediction,
//     nnData,
//     mapPredictions,
//     glowingEle,
//     formulaOn,
//     clickedGrad,
//     loss,
//   ]);

//   const onValueChange = (i, v) => {
//     setComingData(v);
//     setComingIdx(i);
//   };

//   const onBiasChange = (v) => {
//     console.log("onBiasChange: ", v);
//   };

//   const onEdgeMouseEnter = (event, edge) => {
//     const edgeId = edge.id;
//     setEdges((prevElements) =>
//       prevElements.map((element) =>
//         element.id === edgeId
//           ? {
//               ...element,
//               data: {
//                 ...element.data,
//                 isHovered: true,
//               },
//             }
//           : element
//       )
//     );
//   };

//   const onEdgeMouseLeave = (event, edge) => {
//     const edgeId = edge.id;
//     setEdges((prevElements) =>
//       prevElements.map((element) =>
//         element.id === edgeId
//           ? {
//               ...element,
//               data: {
//                 ...element.data,
//                 isHovered: false,
//               },
//             }
//           : element
//       )
//     );
//   };

//   const onGradArrowClick = (id) => {
//     console.log("grad clicked", id);
//     setClickedGrad(id);
//   };

//   const onWeightIncrease = (id) => {
//     let param;
//     if (id.includes("w")) {
//       param = inOutNN.layers[id[1] - 1].neurons[id[2] - 1].w[id[4] - 1];
//     } else if (id.includes("b")) {
//       param = inOutNN.layers[id[1] - 1].neurons[id[2] - 1].b;
//     }
//     param.data += weightStep;
//     if (param.data > 1) {
//       param.data = 1;
//     }

//     setNnData(updateNodeData());
//     handleFeed(inputs, target);
//   };

//   const onWeightDecrease = (id) => {
//     let param;
//     if (id.includes("w")) {
//       param = inOutNN.layers[id[1] - 1].neurons[id[2] - 1].w[id[4] - 1];
//     } else if (id.includes("b")) {
//       param = inOutNN.layers[id[1] - 1].neurons[id[2] - 1].b;
//     }
//     param.data -= weightStep;
//     if (param.data < -1) {
//       param.data = -1;
//     }
//     setNnData(updateNodeData());
//     handleFeed(inputs, target);
//   };

//   const onParamHover = (id) => {
//     if (id === "grad0") {
//       setGlowingEle(["loss", "p-l", "prediction", "a-p", "n11a"]);
//     } else if (id === "grad1") {
//       setGlowingEle(["n11a", "n11s"]);
//     } else if (id === "grad2") {
//       setGlowingEle(["n11s", clickedGrad]);
//     } else {
//       setGlowingEle([id]);
//     }
//   };

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
//             onEdgeMouseEnter={onEdgeMouseEnter}
//             onEdgeMouseLeave={onEdgeMouseLeave}
//             onConnect={onConnect}
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
