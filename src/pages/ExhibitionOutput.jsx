// src/pages/Page3.jsx
import React, { useState, useEffect } from "react";
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { tw } from "twind";

import SliderNode from "../components/SliderNode.jsx";
import FaceNode from "../components/FaceNode.jsx";
import NormalEdge from "../components/NormalEdge.jsx";

import { useSocket } from "../SocketProvider.jsx";

const nodeTypes = {
  SliderNode: SliderNode,
  FaceNode: FaceNode,
};

const edgeTypes = {
  NormalEdge: NormalEdge,
};

export default function ExhibitionOutput() {
  const datumX = 100;
  const datumY = 50;
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const socket = useSocket();

  const [prediction, setPrediction] = useState(0);
  const [target, setTarget] = useState(1);
  const [inputData, setInputData] = useState([0, 0]);

  // Listen for prediction data from Page 2
  useEffect(() => {
    if (socket) {
      socket.on("page2ToPage3", (data) => {
        setPrediction(data.prediction);
        setTarget(data.target);
        setInputData(data.inputData);
      });

      return () => {
        socket.off("page2ToPage3");
      };
    }
  }, [socket]);

  // Update nodes when prediction changes
  useEffect(() => {
    const newNodes = [
      {
        id: "prediction",
        data: {
          value: Number(prediction),
          target: target,
          text: "Final Prediction",
        },
        position: {
          x: datumX + 400,
          y: datumY + 100,
        },
        type: "SliderNode",
        draggable: false,
      },
      {
        id: "face",
        data: {
          value: Math.abs(Number(prediction) - target),
        },
        position: {
          x: datumX + 650,
          y: datumY + 100,
        },
        type: "FaceNode",
        draggable: false,
      },
      {
        id: "input-info",
        data: {
          label: `Input: [${inputData[0]?.toFixed(2)}, ${inputData[1]?.toFixed(
            2
          )}]`,
        },
        position: {
          x: datumX + 200,
          y: datumY + 50,
        },
        type: "TextNode",
        draggable: false,
      },
      {
        id: "target-info",
        data: {
          label: `Target: ${target}`,
        },
        position: {
          x: datumX + 200,
          y: datumY + 100,
        },
        type: "TextNode",
        draggable: false,
      },
    ];

    const newEdges = [
      {
        id: "p-f",
        source: "prediction",
        target: "face",
        animated: false,
        type: "NormalEdge",
      },
    ];

    setNodes(newNodes);
    setEdges(newEdges);
  }, [prediction, target, inputData]);

  return (
    <>
      <ReactFlowProvider>
        <div style={{ height: "500px", width: "1250px" }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
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
