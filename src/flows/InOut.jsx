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
import BlackBox from "../components/BlackBox.jsx";

const nodeTypes = {
  InputField: InputField,
  DragNode: DragNode,
  BlackBox: BlackBox,
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

  const [targets, setTargets] = useState([1, 1, -1, -1]);
  const [selectedData, setSelectedData] = useState(0);

  useEffect(() => {
    console.log("Current selected data:", selectedData);
    console.log("Current inputs:", inputs);

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
          onValueChange: onValueChange,
        },
        position: {
          x: 400,
          y: 30,
        },
        type: "DragNode",
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
        type: "DragNode",
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
        type: "DragNode",
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

    setNodes(newNodes); // Set the new nodes to trigger re-render
    setEdges(newEdges);
  }, [selectedData, inputs]); // Add dependencies

  const onSelect = (idx) => {
    console.log(`InOut knows Selected data: ${idx}`);
    setSelectedData(idx);
  };

  const onValueChange = (i, v) => {
    console.log(`InOut knows Value change: ${v}`);
    const newInputs = [...inputs];
    newInputs[selectedData][i] = v;
    setInputs(newInputs);
  };

  return (
    <ReactFlowProvider>
      <div style={{ height: "300px", width: "80%" }}>
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
