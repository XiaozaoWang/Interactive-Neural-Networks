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

import InputField from "../components/InputField.jsx";
import DragNode from "../components/DragNode.jsx";
import SliderNode from "../components/SliderNode.jsx";
import BlackBox from "../components/BlackBox.jsx";
import TextNode from "../components/TextNode.jsx";
import { text } from "d3";

const nodeTypes = {
  InputField: InputField,
  DragNode: DragNode,
  SliderNode: SliderNode,
  BlackBox: BlackBox,
  TextNode: TextNode,
};

const InOut = ({}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const onConnect = useCallback(
    (connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges]
  );

  const [inputs, setInputs] = useState([
    [0.8, 0.1],
    [0.9, 0.1],
    [0.2, 0.7],
    [0.1, 0.9],
  ]);

  const [targets, setTargets] = useState([1, 1, 0, 0]);
  const [selectedData, setSelectedData] = useState(0);
  const [comingData, setComingData] = useState(null);
  const [comingIdx, setComingIdx] = useState(null);

  useEffect(() => {
    const newNodes = [
      {
        id: "test",
        data: {
          inputs: inputs,
          targets: targets,
          selectedData: selectedData,
          onSelect: onSelect,
        },
        position: {
          x: 100,
          y: 50,
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
          text: "Input 1",
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
        },
        position: {
          x: 400,
          y: 170,
        },
        type: "SliderNode",
        draggable: false,
      },
      {
        id: "blackbox",
        data: {},
        position: {
          x: 600,
          y: 50,
        },
        type: "BlackBox",
        draggable: false,
      },
      {
        id: "output",
        data: {
          value: targets[selectedData], // Change based on selectedData
        },
        position: {
          x: 1000,
          y: 100,
        },
        type: "SliderNode",
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
        target: "output",
        // sourceHandle: "right",
        animated: true,
      },
    ];

    console.log("newNodes:", newNodes);
    setNodes(newNodes); // Set the new nodes to trigger re-render
    setEdges(newEdges);
  }, [selectedData, inputs]); // Add dependencies

  useEffect(() => {
    const newInputs = [...inputs];
    console.log("newInputs:", newInputs);
    console.log("comingData:", comingData);
    console.log("comingIdx:", comingIdx);
    newInputs[selectedData][comingIdx] = comingData;
    setInputs(newInputs);
  }, [comingData, comingIdx]);
  // The most important thing I learned is:
  //  1. Functions passed to child components have closures (solvable), d3.drag() has closures (can't be solved)
  //  2. Therefore, the best way is to keep all the data management in the parent component, and leave the child components only for rendering (as dumb as possible!)

  const onSelect = (idx) => {
    setSelectedData(idx);
  };

  const onValueChange = (i, v) => {
    setComingData(v);
    setComingIdx(i);
  };

  return (
    <ReactFlowProvider>
      <div style={{ height: "300px", width: "100%" }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          panOnDrag={false}
          zoomOnScroll={false}
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
  );
};

export default InOut;
