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
import { drag, text } from "d3";

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
};

const SinglePredict = ({}) => {
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
    [-0.6, 0.7],
    [-0.9, 0.9],
    [-0.8, 0.8],
    [-0.9, 0.65],
  ]);

  const [targets, setTargets] = useState([1, 1, 1, 1, -1, -1, -1, -1]);
  const [selectedData, setSelectedData] = useState(0);
  const [comingData, setComingData] = useState(null);
  const [comingIdx, setComingIdx] = useState(null);

  // backend neural network
  const [inOutNN, setInOutNN] = useState(new MLP(2, [3, 3, 1]));
  const [prediction, setPrediction] = useState(-1); // plain numbers
  const [loss, setLoss] = useState(new Value(0));
  const [nnData, setNnData] = useState([]);
  let predd = -1;

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

  useEffect(() => {
    const newNodes = [
      {
        id: "inputfield",
        data: {
          inputs: inputs,
          targets: targets,
          selectedData: selectedData,
          onSelect: onSelect,
        },
        position: {
          x: 100,
          y: 30,
        },
        type: "InputField",
        draggable: false,
      },
      {
        id: "input1",
        data: {
          value: inputs[selectedData][0], // Change based on selectedData
          selectedData: selectedData,
          onValueChange: onValueChange,
          text: "Size",
          draggable: false,
        },
        position: {
          x: 400,
          y: 30,
        },
        type: "SliderNode",
        draggable: false,
      },
      {
        id: "input2",
        data: {
          value: inputs[selectedData][1], // Change based on selectedData
          onValueChange: onValueChange,
          text: "Color",
          draggable: false,
        },
        position: {
          x: 400,
          y: 200,
        },
        type: "SliderNode",
        draggable: false,
      },
      {
        id: "blackbox",
        data: {
          handleTrain: handleTrain,
        },
        position: {
          x: 600,
          y: 100,
        },
        type: "BlackBox",
        draggable: false,
      },
      {
        id: "prediction",
        data: {
          value: Number(prediction), // Change based on selectedData
          onValueChange: onValueChange,
          text: "Prediction",
        },
        position: {
          x: 900,
          y: 100,
        },
        type: "SliderNode",
        draggable: false,
      },
      {
        id: "target",
        data: {
          value: targets[selectedData], // Change based on selectedData
          onValueChange: onValueChange,
          text: "Answer",
          grayscale: 50, // doesn't look good
        },
        position: {
          x: 1050,
          y: 100,
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
          x: 990,
          y: 155,
        },
        type: "FaceNode",
        draggable: false,
      },
    ];

    const newEdges = [
      {
        id: "edge1",
        source: "input1",
        target: "blackbox",
        // sourceHandle: "right",
        animated: true,
      },
      {
        id: "edge2",
        source: "input2",
        target: "blackbox",
        // sourceHandle: "right",
        animated: true,
      },
      {
        id: "edge3",
        source: "blackbox",
        target: "prediction",
        // sourceHandle: "right",
        animated: true,
      },
      {
        id: "edge4",
        source: "prediction",
        target: "target",
        // sourceHandle: "right",
        animated: false,
      },
    ];

    // console.log("newNodes:", newNodes);
    setNodes(newNodes); // Set the new nodes to trigger re-render
    setEdges(newEdges);
  }, [selectedData, inputs, prediction]); // Add dependencies

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

  return (
    <>
      <ReactFlowProvider>
        <div style={{ height: "400px", width: "1250px" }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            // panOnDrag={false}
            // zoomOnScroll={false}
            zoomOnDoubleClick={false}
          >
            {/* <Controls /> */}
            <Background
              bgColor="#fafafa"
              variant={false}
              // style={{ border: "1px solid black" }}
            />
          </ReactFlow>
        </div>
      </ReactFlowProvider>
    </>
  );
};

export default SinglePredict;
