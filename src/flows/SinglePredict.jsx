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
import { mean_squared_error, MLP, Value } from "../micrograd";
import { tw } from "twind";

import InputField from "../components/InputField.jsx";
import DragNode from "../components/DragNode.jsx";
import SliderNode from "../components/SliderNode.jsx";
import BlackBox from "../components/BlackBox.jsx";
import TextNode from "../components/TextNode.jsx";
import GraphNode from "../components/GraphNode.jsx";
import ButtonNode from "../components/ButtonNode.jsx";
import FaceNode from "../components/FaceNode.jsx";
import SumNode from "../components/SumNode.jsx";
import BiasNode from "../components/BiasNode.jsx";
import ParamEdge from "../components/ParamEdge.jsx";
import NormalEdge from "../components/NormalEdge.jsx";
import { drag, map, text } from "d3";

const nodeTypes = {
  InputField: InputField,
  DragNode: DragNode,
  SliderNode: SliderNode,
  BlackBox: BlackBox,
  TextNode: TextNode,
  GraphNode: GraphNode,
  ButtonNode: ButtonNode,
  FaceNode: FaceNode,
  SumNode: SumNode,
  BiasNode: BiasNode,
};

const edgeTypes = {
  ParamEdge: ParamEdge,
  NormalEdge: NormalEdge,
};

const SinglePredict = ({}) => {
  const datumX = 100;
  const datumY = 30;
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const onConnect = useCallback(
    (connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges]
  );

  const [inputs, setInputs] = useState([
    [0.8, -0.9],
    [0.9, -0.7],
    [0.95, -0.9],
    [0.7, -0.7],
    [1.0, -0.5],
    [0.4, -0.8],
    [-0.6, 0.7],
    [-0.9, 0.9],
    [-0.8, 0.8],
    [-0.9, 0.65],
    [-0.6, 0.5],
    [-0.4, 0.9],
  ]);

  const [targets, setTargets] = useState([
    1, 1, 1, 1, 1, 1, -1, -1, -1, -1, -1, -1,
  ]);
  const [selectedData, setSelectedData] = useState(0);
  const [comingData, setComingData] = useState(null);
  const [comingIdx, setComingIdx] = useState(null);
  const [glowingEle, setGlowingEle] = useState(null);

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
    // console.log("mapArray:", mapArray);
    return mapArray;
  }
  const [mapPredictions, setMapPredictions] = useState([[]]); // Ensure it's a 2D array!

  // backend neural network
  const [inOutNN, setInOutNN] = useState(new MLP(2, [1]));
  const [prediction, setPrediction] = useState(-1); // plain numbers
  const [loss, setLoss] = useState(new Value(0));
  const [nnData, setNnData] = useState([]);
  const weightStep = 0.1;

  const handleFeed = (selected) => {
    // console.log("selected:", selected);
    // console.log("inputs:", inputs[selected]);
    const pred = inOutNN.forward(inputs[selected]);
    // console.log("prediction:", pred.data);
    setPrediction(pred.data.toFixed(2));
    const target = targets[selected];
    // console.log("target:", target);
    // turn pred and target into arrays
    const predArr = [pred];
    const targetArr = [target];
    const loss = mean_squared_error(targetArr, predArr);
    // console.log("loss:", loss.data);
    setLoss(loss);

    // update the prediction map
    const mapPred = mapArray.map((row) =>
      row.map((point) => {
        const pred = inOutNN.forward(point);
        return pred.data.toFixed(1);
      })
    );
    // console.log("mapPred:", mapPred);
    setMapPredictions(mapPred);
  };

  const handleTrain = () => {
    handleFeed(selectedData); // sets a new Loss Value every time to prevent error in gradient update
    // zero out grads
    for (let p of inOutNN.parameters()) {
      p.grad = 0.0;
    }
    loss.backward();
    for (let p of inOutNN.parameters()) {
      p.data += -1 * p.grad * 0.05;
    }

    setNnData(updateNodeData()); // [!] every time nnData is reset using "setNnData", the child components that takes in nnData will re-render
    // console.log("nnData:", nnData);
  };

  // initialization: Set the initial node data, feed and predict the default data point
  useEffect(() => {
    setNnData(updateNodeData());
    handleFeed(selectedData);
  }, []);

  function updateNodeData() {
    const layers = inOutNN.layers.map((layer) =>
      layer.neurons.map((neuron) => ({
        weights: neuron.w.map((w) => w.data),
        bias: neuron.b.data,
        output: neuron.out.data,
        grad: neuron.b.grad,
      }))
    );
    const updatedData = { size: inOutNN.sz, layers: layers };
    // console.log("updatedData: ", updatedData);
    return updatedData;
  }

  // re-render nodes and edges
  useEffect(() => {
    const newNodes = [
      {
        id: "inputfield",
        data: {
          inputs: inputs,
          targets: targets,
          selectedData: selectedData,
          onSelect: onSelect,
          mapUnits: mapUnits,
          mapPredictions: mapPredictions,
        },
        position: {
          x: datumX,
          y: datumY,
        },
        type: "InputField",
        draggable: false,
      },
      {
        id: "i1",
        data: {
          value: inputs[selectedData][0], // Change based on selectedData
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
          value: inputs[selectedData][1], // Change based on selectedData
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
          inputs: inputs[selectedData],
          weights: inOutNN.layers[0].neurons[0].w.map((w) => w.data),
          bias: inOutNN.layers[0].neurons[0].b.data,
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
          value: Number(prediction), // Change based on selectedData
          target: targets[selectedData],
          onValueChange: onValueChange,
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
        id: "target",
        data: {
          value: targets[selectedData], // Change based on selectedData
          onValueChange: onValueChange,
          text: "Label",
          grayscale: 50, // doesn't look good
        },
        position: {
          x: datumX + 950,
          y: datumY + 80,
        },
        type: "SliderNode",
        draggable: false,
      },
      {
        id: "face",
        data: {
          value: Math.abs(Number(prediction) - targets[selectedData]), // Change based on selectedData
        },
        position: {
          x: datumX + 890,
          y: datumY + 135,
        },
        type: "FaceNode",
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
          value: inOutNN.layers[0].neurons[0].w[0].data.toFixed(2),
          isHovered: false,
          glowingEle: glowingEle,
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
          value: inOutNN.layers[0].neurons[0].w[1].data.toFixed(2),
          isHovered: false,
          glowingEle: glowingEle,
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
          value: inOutNN.layers[0].neurons[0].b.data.toFixed(2),
          isHovered: false,
          glowingEle: glowingEle,
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
        id: "p-t",
        source: "prediction",
        target: "target",
        animated: false,
        type: "NormalEdge",
      },
    ];

    setNodes(newNodes); // Set the new nodes to trigger re-render
    setEdges(newEdges);
  }, [selectedData, inputs, prediction, nnData, mapPredictions, glowingEle]); // Add dependencies

  useEffect(() => {
    const newInputs = [...inputs];
    // console.log("newInputs:", newInputs);
    // console.log("comingData:", comingData);
    // console.log("comingIdx:", comingIdx);
    newInputs[selectedData][comingIdx] = comingData;
    setInputs(newInputs);
  }, [comingData, comingIdx]);
  // The most important thing I learned is:
  //  1. Functions passed to child components have closures (solvable), d3.drag() has closures (can't be solved)
  //  2. Therefore, the best way is to keep all the data management in the parent component, and leave the child components only for rendering (as dumb as possible!)

  const onSelect = (idx) => {
    setSelectedData(idx); // problem is here. This is not updating the selectedData right away (?)
    handleFeed(idx);
  };

  const onValueChange = (i, v) => {
    setComingData(v);
    setComingIdx(i);
  };

  const onBiasChange = (v) => {
    console.log("onBiasChange: ", v);
  };

  const onEdgeMouseEnter = (event, edge) => {
    const edgeId = edge.id;
    // console.log("Mouse entered the edge", edgeId);

    // Updates edge
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
    // console.log("Mouse left the edge", edgeId);
    // Updates edge
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

  const onWeightIncrease = (id) => {
    let param;
    if (id.includes("w")) {
      // weight
      param = inOutNN.layers[id[1] - 1].neurons[id[2] - 1].w[id[4] - 1];
    } else if (id.includes("b")) {
      // bias
      param = inOutNN.layers[id[1] - 1].neurons[id[2] - 1].b;
    }
    param.data += weightStep;
    // limit to [-1,1]
    if (param.data > 1) {
      param.data = 1;
    }

    setNnData(updateNodeData());
    handleFeed(selectedData); // remember to update the prediction after changing the weights!
  };

  const onWeightDecrease = (id) => {
    let param;
    if (id.includes("w")) {
      // weight
      param = inOutNN.layers[id[1] - 1].neurons[id[2] - 1].w[id[4] - 1];
    } else if (id.includes("b")) {
      // bias
      param = inOutNN.layers[id[1] - 1].neurons[id[2] - 1].b;
    }
    param.data -= weightStep;
    // limit to [-1,1]
    if (param.data < -1) {
      param.data = -1;
    }
    setNnData(updateNodeData());
    handleFeed(selectedData);
  };

  const onParamHover = (id) => {
    // console.log("onParamHover: ", id);
    setGlowingEle(id);
  };

  return (
    <>
      <ReactFlowProvider>
        <div style={{ height: "450px", width: "1250px" }}>
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
            {/* <Controls /> */}
            <Background
              bgColor="#fafafa"
              variant={false}
              style={{ border: "1px solid lightgray" }}
            />
          </ReactFlow>
        </div>
      </ReactFlowProvider>
    </>
  );
};

export default SinglePredict;
