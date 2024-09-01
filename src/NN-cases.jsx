import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  ReactFlowProvider,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import Node from "./components/Node.jsx";
import DragNode from "./components/DragNode.jsx";
import GraphNode from "./components/GraphNode.jsx";
import Edge from "./components/Edge.jsx";

const nodeTypes = {
  node: Node,
  dragNode: DragNode,
  graphNode: GraphNode,
};

const edgeTypes = {
  edge: Edge,
};

const NN = ({ nnData, lastInputData }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const isInitialized = useRef(false); // Flag to track initialization

  // Initialize nodes and edges once
  useEffect(() => {
    if (!isInitialized.current && nnData.layers) {
      buildGraph(nnData);
      isInitialized.current = true; // Mark as initialized
    }
  }, [nnData]);

  // Update nodes and edges whenever nnData or lastInputData changes
  useEffect(() => {
    if (isInitialized.current && nnData.layers) {
      updateGraph(nnData);
    }
  }, [nnData]);

  const buildGraph = (nnData) => {
    let nodes = [];
    let edges = [];

    // Input layer nodes
    for (let i = 0; i < nnData.size[0]; i++) {
      const nodeId = `I${i}`;
      nodes.push({
        id: nodeId,
        data: {
          label: nodeId,
          Input: 0,
        },
        position: {
          x: 0,
          y: 100 + i * 150,
        },
        type: "node",
      });
    }

    // Hidden/output layer nodes
    nnData.layers.forEach((layer, layerIndex) => {
      layer.forEach((neuron, neuronIndex) => {
        const nodeId = `L${layerIndex}N${neuronIndex}`;
        nodes.push({
          id: nodeId,
          data: {
            label: nodeId,
            Bias: neuron.bias.toFixed(2),
            Output: neuron.output.toFixed(2),
            Grad: neuron.grad.toFixed(2),
          },
          position: {
            x: (layerIndex + 1) * 350,
            y: 100 + neuronIndex * 150,
          },
          type: "node",
        });

        if (layerIndex === 0) {
          // Input layer connection
          for (let i = 0; i < nnData.size[0]; i++) {
            const inputNodeId = `I${i}`;
            const currentNodeId = `L${layerIndex}N${neuronIndex}`;
            const edgeId = `${inputNodeId}-${currentNodeId}`;
            const val = neuron.weights[i].toFixed(2);
            edges.push({
              id: edgeId,
              source: inputNodeId,
              target: currentNodeId,
              type: "edge",
              data: {
                value: val,
                isHovered: false,
              },
            });
          }
        } else {
          // Hidden/output layer connection
          const prevLayer = nnData.layers[layerIndex - 1];
          prevLayer.forEach((prevNeuron, prevNeuronIndex) => {
            const prevNodeId = `L${layerIndex - 1}N${prevNeuronIndex}`;
            const currentNodeId = `L${layerIndex}N${neuronIndex}`;
            const edgeId = `${prevNodeId}-${currentNodeId}`;
            const val = neuron.weights[prevNeuronIndex].toFixed(2);
            edges.push({
              id: edgeId,
              source: prevNodeId,
              target: currentNodeId,
              type: "edge",
              data: {
                value: val,
                isHovered: false,
              },
            });
          });
        }
      });
    });

    setNodes(nodes);
    setEdges(edges);
  };

  const updateGraph = (nnData) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (!node.id.startsWith("I")) {
          const [layerIndex, neuronIndex] = node.id
            .substring(1)
            .split("N")
            .map(Number);
          console.log("layerIndex, neuronIndex: ", layerIndex, neuronIndex);
          const neuron = nnData.layers[layerIndex][neuronIndex];
          return {
            ...node,
            data: {
              ...node.data,
              Bias: neuron.bias.toFixed(2),
              Output: neuron.output.toFixed(2),
              Grad: neuron.grad.toFixed(2),
            },
          };
        } else {
          // (!) it's important that you create a new node object
          // in order to notify react flow about the change
          return {
            ...node,
          };
        }
      })
    );
  };

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    []
  );

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

  return (
    <ReactFlowProvider>
      <div style={{ height: "100vh" }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onEdgeMouseEnter={onEdgeMouseEnter}
          onEdgeMouseLeave={onEdgeMouseLeave}
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

export default NN;
