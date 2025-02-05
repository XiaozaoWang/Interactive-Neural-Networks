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
import ParamEdge from "../components/ParamEdge.jsx";
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

const edgeTypes = {
  ParamEdge: ParamEdge,
};

const SinglePredict = ({}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const onConnect = useCallback(
    (connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges]
  );

  const [input1, setInput1] = useState(0);
  const [input2, setInput2] = useState(0);

  function step(x) {
    return x > 0 ? 1 : 0;
  }
  function tanh(x) {
    return (Math.exp(2 * x) - 1) / (Math.exp(2 * x) + 1);
  }

  useEffect(() => {
    const newNodes = [
      {
        id: "input1",
        data: {
          value: input1,
          onValueChange: onValueChange,
          text: "Input",
          draggable: true,
        },
        position: {
          x: 100,
          y: 100,
        },
        type: "SliderNode",
        draggable: false,
      },
      {
        id: "activation1",
        data: {
          input: input1,
          output: tanh(input1),
          func: tanh,
          text: "Activation",
          draggable: false,
        },
        position: {
          x: 200,
          y: 100,
        },
        type: "GraphNode",
        draggable: false,
      },
      {
        id: "prediction1",
        data: {
          value: tanh(input1),
          text: "Prediction",
        },
        position: {
          x: 400,
          y: 100,
        },
        type: "SliderNode",
        draggable: false,
      },
      {
        id: "input2",
        data: {
          value: input2,
          onValueChange: onValueChange,
          text: "Input",
          draggable: true,
        },
        position: {
          x: 100,
          y: 300,
        },
        type: "SliderNode",
        draggable: false,
      },
      {
        id: "activation2",
        data: {
          input: input2,
          output: step(input2),
          func: step,
          text: "Activation",
          draggable: false,
        },
        position: {
          x: 200,
          y: 300,
        },
        type: "GraphNode",
        draggable: false,
      },
      {
        id: "prediction2",
        data: {
          value: step(input2),
          text: "Prediction",
        },
        position: {
          x: 400,
          y: 300,
        },
        type: "SliderNode",
        draggable: false,
      },
    ];

    const newEdges = [
      {
        id: "edge1",
        source: "input1",
        target: "activation1",
        animated: true,
      },
      {
        id: "edge2",
        source: "activation1",
        target: "prediction1",
        animated: true,
      },
    ];

    // console.log("newNodes:", newNodes);
    setNodes(newNodes); // Set the new nodes to trigger re-render
    setEdges(newEdges);
  }, [input1, input2]); // Add dependencies. Don't forget to update!!!

  const onValueChange = (i, v) => {
    // console.log("Value changed", i, v);
    if (i == 0) {
      setInput1(v);
    } else if (i == 1) {
      setInput2(v);
    }
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

  return (
    <>
      <ReactFlowProvider>
        <div style={{ height: "600px", width: "1250px" }}>
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
