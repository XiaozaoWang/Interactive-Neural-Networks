import React, { useEffect, useState, useCallback } from "react";
import {
  ReactFlow,
  Controls,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  ReactFlowProvider,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import Node from "../components/Node.jsx";
import DragNode from "../components/DragNode.jsx";
import GraphNode from "../components/GraphNode.jsx";
import ParamEdge from "../components/ParamEdge.jsx";

const nodeTypes = {
  node: Node,
  dragNode: DragNode,
  graphNode: GraphNode,
};

const edgeTypes = {
  ParamEdge: ParamEdge,
};

const NN = ({ nnData, lastInputData }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const handleNodesChange = useCallback(
    (changes) => {
      setNodes((nds) => {
        const updatedNodes = applyNodeChanges(changes, nds);
        return updatedNodes;
      });
    },
    [setNodes]
  );

  // paint nodes and edges
  useEffect(() => {
    if (nnData.layers) {
      const buildGraph = (nnData, lastInputData) => {
        let nodes = [];
        let edges = [];

        // test nodes
        // nodes.push({
        //   id: "test",
        //   data: {
        //     onHeightChange: onHeightChange,
        //   },
        //   position: {
        //     x: 100,
        //     y: 100,
        //   },
        //   type: "graphNode",
        // });

        // input layer nodes
        if (lastInputData) {
          lastInputData.forEach((input, inputIndex) => {
            const nodeId = `I${inputIndex}`;
            nodes.push({
              id: nodeId,
              data: {
                label: nodeId,
                input: input.toFixed(2),
              },
              position: {
                x: 100,
                y: 100 + inputIndex * 150,
              },
              type: "node",
            });
          });
        }

        // hidden/output layer nodes
        nnData.layers.forEach((layer, layerIndex) => {
          layer.forEach((neuron, neuronIndex) => {
            const nodeId = `L${layerIndex}N${neuronIndex}`;
            nodes.push({
              id: nodeId,
              data: {
                label: nodeId,
                bias: neuron.bias.toFixed(2),
                output: neuron.output.toFixed(2),
                grad: neuron.grad.toFixed(2),
              },
              position: {
                x: 100 + (layerIndex + 1) * 350,
                y: 100 + neuronIndex * 150,
              },
              type: "node",
            });

            if (layerIndex == 0) {
              // input layer connection
              const inputLayer = lastInputData;
              inputLayer.forEach((input, inputIndex) => {
                const inputNodeId = `I${inputIndex}`;
                const currentNodeId = `L${layerIndex}N${neuronIndex}`;
                const edgeId = `${inputNodeId}-${currentNodeId}`;
                const val = neuron.weights[inputIndex].toFixed(2);
                edges.push({
                  id: edgeId,
                  source: inputNodeId,
                  target: currentNodeId,
                  type: "ParamEdge",
                  data: {
                    value: val,
                    isHovered: false,
                    nnData: nnData,
                  },
                });
              });
            } else {
              // hidden/output layer connection
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
                  type: "ParamEdge",
                  data: {
                    value: val,
                    isHovered: false,
                    nnData: nnData,
                  },
                });
              });
            }
          });
        });

        setNodes(nodes);
        setEdges(edges);
      };

      buildGraph(nnData, lastInputData);
    }
  }, [nnData, lastInputData]);

  // useEffect // nnData is reset every time the Train button is pressed

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    []
  );

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

  const onHeightChange = (newHeight) => {
    // console.log("newHeight:", newHeight);
  };

  return (
    <ReactFlowProvider>
      <div style={{ height: "800px", width: "100%" }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onNodesChange={handleNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onEdgeMouseEnter={onEdgeMouseEnter}
          onEdgeMouseLeave={onEdgeMouseLeave}
          nodesDraggable={true}
          nodesConnectable={false}
          panOnDrag={false}
          zoomOnScroll={false}
          zoomOnDoubleClick={false}
        >
          {/* <Controls /> */}
          <Background bgColor="#fafafa" variant={BackgroundVariant.Dots} />
          {/* <Background /> */}
        </ReactFlow>
      </div>
    </ReactFlowProvider>
  );
};

export default NN;
