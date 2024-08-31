import React, { useState, useCallback } from "react";
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState, //
  useEdgesState, //
  ReactFlowProvider,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";
import Node2 from "./Node2.jsx";
import Edge2 from "./Edge2.jsx";

const nodeTypes = {
  node: Node2,
};

const edgeTypes = {
  edge: Edge2,
};

const initialNodes = [
  {
    id: "1",
    data: { label: "Node 1" },
    position: { x: 100, y: 200 },
    type: "node",
  },
  {
    id: "2",
    data: { label: "Node 2" },
    position: { x: 350, y: 200 },
    type: "node",
  },
];

const initialEdges = [
  {
    id: "e1-2",
    source: "1",
    target: "2",
    type: "edge",
    // label: "Edge Label",
  },
];

const App2 = () => {
  //   const [nodes] = useState(initialNodes);
  //   const [edges] = useState(initialEdges);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onEdgeMouseEnter = (event, edge) => {
    const edgeId = edge.id;
    console.log("Mouse entered the edge", edgeId);

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
    console.log("Mouse left the edge", edgeId);
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

  return (
    <ReactFlowProvider>
      <div style={{ height: "100vh" }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onNodesChange={onNodesChange} //
          onEdgesChange={onEdgesChange} //
          onEdgeMouseEnter={onEdgeMouseEnter} //
          onEdgeMouseLeave={onEdgeMouseLeave} //
          nodesDraggable={true}
          nodesConnectable={false}
        >
          <Controls />
          <Background />
        </ReactFlow>
      </div>
    </ReactFlowProvider>
  );
};

export default App2;
