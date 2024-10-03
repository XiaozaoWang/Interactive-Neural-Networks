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

import Transparent from "../test/Transparent.jsx";

const nodeTypes = {
  Transparent: Transparent,
};

const InOut = ({}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    // test nodes
    nodes.push({
      id: "test",
      data: {},
      position: {
        x: 100,
        y: 50,
      },
      type: "Transparent",
      draggable: false,
    });
  }, []);

  return (
    <ReactFlowProvider>
      <div style={{ height: "300px", width: "100vh" }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodesConnectable={false}
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
