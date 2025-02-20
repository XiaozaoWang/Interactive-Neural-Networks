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
import { mean_squared_error, MLP, Value } from "../micrograd";

import Node from "../components/Node.jsx";
import InputField from "../components/InputField.jsx";

import DragNode from "../components/DragNode.jsx";
import SliderNode from "../components/SliderNode.jsx";
import BlackBox from "../components/BlackBox.jsx";
import GraphNode from "../components/GraphNode.jsx";
import FaceNode from "../components/FaceNode.jsx";
import SumNode from "../components/SumNode.jsx";
import BiasNode from "../components/BiasNode.jsx";
import OutputNode from "../components/OutputNode.jsx";

import TextNode from "../components/TextNode.jsx";
import FormulaNode from "../components/FormulaNode.jsx";
import PathFormulaNode from "../components/PathFormulaNode.jsx";

import ButtonNode from "../components/ButtonNode.jsx";
import LrNode from "../components/LrNode.jsx";

import ParamEdge from "../components/ParamEdge.jsx";
import NormalEdge from "../components/NormalEdge.jsx";

const nodeTypes = {
  node: Node,
  InputField: InputField,
  DragNode: DragNode,
  SliderNode: SliderNode,
  BlackBox: BlackBox,
  TextNode: TextNode,
  GraphNode: GraphNode,
  ButtonNode: ButtonNode,
  FaceNode: FaceNode,
  SumNode: SumNode,
  OutputNode: OutputNode,
  BiasNode: BiasNode,
  LrNode: LrNode,
  FormulaNode: FormulaNode,
  PathFormulaNode: PathFormulaNode,
};

const edgeTypes = {
  ParamEdge: ParamEdge,
  NormalEdge: NormalEdge,
};

const NN2 = () => {
  // const [inputs, setInputs] = useState([
  //   [2.0, 3.0, -1.0],
  //   [3.0, -1.0, 0.5],
  //   [0.5, 1.0, 1.0],
  //   [1.0, 1.0, -1.0],
  // ]);
  // const [targets, setTargets] = useState([1.0, -1.0, -1.0, 1.0]);
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
  const [formulaOn, setFormulaOn] = useState(false);
  const [clickedGrad, setClickedGrad] = useState(null);

  const [prediction, setPrediction] = useState(-1); // plain numbers
  const [loss, setLoss] = useState(new Value(0));
  const [nnData, setNnData] = useState([]);
  const [prevNNData, setPrevNNData] = useState(null);
  const weightStep = 0.1;

  const [paths, setPaths] = useState([]);
  const [glowingEle, setGlowingEle] = useState([]);

  // activation functions
  function tanh(x) {
    return (Math.exp(2 * x) - 1) / (Math.exp(2 * x) + 1);
  }

  const architecture = [2, 3, 2, 1];
  const [NN, setNN] = useState(new MLP(2, architecture));

  const datumX = 100;
  const datumY = 180;

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

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

  const handleNodesChange = useCallback(
    (changes) => {
      setNodes((nds) => {
        const updatedNodes = applyNodeChanges(changes, nds);
        return updatedNodes;
      });
    },
    [setNodes]
  );

  // Initialize nnData
  useEffect(() => {
    setNnData(updateNodeData());
    handleFeed(selectedData);
  }, []);

  const handleFeed = (selected) => {
    // console.log("selected:", selected);
    // console.log("inputs:", inputs[selected]);
    // console.log("nnData1:", nnData);
    const pred = NN.forward(inputs[selected]);
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
        const pred = NN.forward(point);
        return pred.data.toFixed(1);
      })
    );
    // console.log("mapPred:", mapPred);
    setMapPredictions(mapPred);
  };

  const handleStep = () => {
    // setPrevNNData(nnData);
    handleFeed(selectedData); // sets a new Loss Value every time to prevent error in gradient update
    // zero out grads
    for (let p of NN.parameters()) {
      p.grad = 0.0;
    }
    loss.backward();
    for (let p of NN.parameters()) {
      p.data += -1 * p.grad * 0.05;
    }

    setNnData(updateNodeData()); // [!] every time nnData is reset using "setNnData", the child components that takes in nnData will re-render
    console.log("nnData2:", nnData);
  };

  const handleTrain = () => {
    // for (let i = 0; i < 10; i++) {
    //   handleStep();
    // }
  };

  function updateNodeData() {
    // merge the w and b gradients into a single array

    const layers = NN.layers.map((layer) =>
      layer.neurons.map((neuron) => ({
        weights: neuron.w.map((w) => w.data),
        bias: neuron.b.data,
        output: neuron.out.data,
        gradw: neuron.w.map((w) => w.grad),
        gradb: neuron.b.grad,
      }))
    );
    const updatedData = { size: NN.sz, layers: layers };
    // console.log("updatedData: ", updatedData);
    return updatedData;
  }

  // --- NEW: Helper functions to compute backpropagation paths ---
  function getPathsFromLayer(currentLayer, prevNode, arch) {
    if (currentLayer === arch.length) {
      return [[]];
    }
    let allPaths = [];
    for (let node = 0; node < arch[currentLayer]; node++) {
      // Create the edge id from the previous node to the current node
      const edgeId = `L${currentLayer}N${node}w${prevNode}`;
      const nodeId = `L${currentLayer}N${node}`;
      const subPaths = getPathsFromLayer(currentLayer + 1, node, arch);
      subPaths.forEach((subPath) => {
        allPaths.push([edgeId, nodeId, ...subPath]);
      });
    }
    return allPaths;
  }

  function getBackpropPaths(weightBiasId, arch) {
    const pattern = /^L(\d+)N(\d+)(w\d+|b)$/;
    const match = weightBiasId.match(pattern);
    if (!match) {
      console.error("Invalid weight/bias id format.");
      return [];
    }
    const layer = parseInt(match[1], 10);
    const node = parseInt(match[2], 10);
    if (layer + 1 >= arch.length) {
      return [];
    }
    return getPathsFromLayer(layer + 1, node, arch).map((path) => [
      weightBiasId,
      weightBiasId.slice(0, 4),
      ...path,
    ]);
  }

  // --- NEW: Update the paths state whenever clickedGrad changes ---
  useEffect(() => {
    if (clickedGrad) {
      const newPaths = getBackpropPaths(clickedGrad, architecture);
      setPaths(newPaths);
      // console.log("Updated paths:", newPaths);
      setGlowingEle(newPaths[0]);
    } else {
      setPaths([]);
    }
  }, [clickedGrad]);

  // paint nodes and edges
  useEffect(() => {
    if (nnData.layers) {
      const buildGraph = (nnData, selecteData) => {
        let nodes = [];
        let edges = [];

        // test nodes
        nodes.push(
          {
            id: "step-button",
            data: {
              text: "Step",
              handleClick: handleStep,
            },
            position: {
              x: datumX,
              y: 50,
            },
            type: "ButtonNode",
            draggable: false,
          },
          {
            id: "train-button",
            data: {
              text: "Train",
              handleClick: handleTrain,
            },
            position: {
              x: datumX + 80,
              y: 50,
            },
            type: "ButtonNode",
            draggable: false,
          },
          {
            id: "lr",
            data: {
              handleClick: (lr) => {
                console.log("lr:", lr);
              },
            },
            position: {
              x: datumX + 160,
              y: 50,
            },
            type: "LrNode",
            draggable: false,
          },
          {
            id: "formula",
            data: {
              onPathHover: onPathHover,
              formulaOn: formulaOn,
              clickedGrad: clickedGrad,
              allPaths: paths,
            },
            position: {
              x: datumX + 260,
              y: 50,
            },
            type: "PathFormulaNode",
            draggable: false,
          }
        );

        // input layer nodes
        // console.log("selectedData", selectedData);
        inputs[selectedData].forEach((input, inputIndex) => {
          const nodeId = `i${inputIndex - 1}`;
          nodes.push({
            id: nodeId,
            data: {
              value: inputs[selectedData][inputIndex], // Change based on selectedData
              selectedData: selectedData,
              glowingEle: glowingEle,
              text: "Size",
              draggable: true,
            },
            position: {
              x: 50,
              y: 100 + inputIndex * 150,
            },
            type: "SliderNode",
            draggable: true,
          });
        });

        // Add bias node for input layer
        nodes.push({
          id: "dumbi",
          data: { label: "Bias" },
          position: { x: 50, y: 100 + inputs[selectedData].length * 150 },
          type: "BiasNode",
          draggable: true,
        });

        // hidden/output layer nodes
        nnData.layers.forEach((layer, layerIndex) => {
          // Add bias node for each layer except output
          if (layerIndex !== nnData.layers.length - 1) {
            const biasNodeId = `dumbL${layerIndex}`;
            nodes.push({
              id: biasNodeId,
              data: { label: "Bias" },
              position: {
                x: 50 + (layerIndex + 1) * 250,
                y: 100 + layer.length * 200,
              },
              type: "BiasNode",
              draggable: true,
            });
          }

          layer.forEach((neuron, neuronIndex) => {
            const nodeId = `L${layerIndex}N${neuronIndex}`;
            nodes.push({
              id: nodeId,
              data: {
                sum: neuron.output,
                inputs: inputs[selectedData],
                label: nodeId,
                glowingEle: glowingEle,
                size: { w: 50, h: 100 },
              },
              position: {
                x: 50 + (layerIndex + 1) * 250,
                y: 100 + neuronIndex * 200,
              },
              type: "OutputNode",
              draggable: true,
            });

            if (layerIndex == 0) {
              // input layer connection
              const inputLayer = inputs[selectedData];
              inputLayer.forEach((input, inputIndex) => {
                const inputNodeId = `i${inputIndex - 1}`;
                const currentNodeId = `L${layerIndex}N${neuronIndex}`;
                const edgeId = `L${layerIndex}N${neuronIndex}w${inputIndex}`;
                const val = neuron.weights[inputIndex].toFixed(2);
                edges.push({
                  id: edgeId,
                  source: inputNodeId,
                  target: currentNodeId,
                  type: "ParamEdge",
                  data: {
                    value: val,
                    isHovered: false,
                    layerIndex: layerIndex,
                    neuronIndex: neuronIndex,
                    nnData: nnData,
                    showLabel: false,
                    onGradArrowClick: onGradArrowClick,
                    glowingEle: glowingEle,
                    clickedGrad: clickedGrad,
                  },
                });
              });
              // Bias edge for input layer
              edges.push({
                id: `L${layerIndex}N${neuronIndex}b`,
                source: "dumbi",
                target: `L${layerIndex}N${neuronIndex}`,
                type: "ParamEdge",
                data: {
                  value: neuron.bias.toFixed(2),
                  nnData: nnData,
                  layerIndex: layerIndex,
                  neuronIndex: neuronIndex,
                  onGradArrowClick: onGradArrowClick,
                  glowingEle: glowingEle,
                  clickedGrad: clickedGrad,
                },
              });
            } else {
              // hidden/output layer connection
              const prevLayer = nnData.layers[layerIndex - 1];
              prevLayer.forEach((prevNeuron, prevNeuronIndex) => {
                const prevNodeId = `L${layerIndex - 1}N${prevNeuronIndex}`;
                const currentNodeId = `L${layerIndex}N${neuronIndex}`;
                const edgeId = `L${layerIndex}N${neuronIndex}w${prevNeuronIndex}`;
                const val = neuron.weights[prevNeuronIndex].toFixed(2);
                edges.push({
                  id: edgeId,
                  source: prevNodeId,
                  target: currentNodeId,
                  type: "ParamEdge",
                  data: {
                    value: val,
                    isHovered: false,
                    layerIndex: layerIndex,
                    neuronIndex: neuronIndex,
                    nnData: nnData,
                    showLabel: false,
                    onGradArrowClick: onGradArrowClick,
                    glowingEle: glowingEle,
                    clickedGrad: clickedGrad,
                  },
                });
              });
              // Bias edge for hidden layers
              // console.log(
              //   "aaa",
              //   `dumbL${layerIndex - 1}`,
              //   `L${layerIndex}N${neuronIndex}`
              // );
              edges.push({
                id: `L${layerIndex}N${neuronIndex}b`,
                source: `dumbL${layerIndex - 1}`,
                target: `L${layerIndex}N${neuronIndex}`,
                type: "ParamEdge",
                data: {
                  value: neuron.bias.toFixed(2),
                  nnData: nnData,
                  layerIndex: layerIndex,
                  neuronIndex: neuronIndex,
                  onGradArrowClick: onGradArrowClick,
                  glowingEle: glowingEle,
                  clickedGrad: clickedGrad,
                },
              });
            }
          });
        });

        setNodes(nodes);
        setEdges(edges);
      };

      buildGraph(nnData, selectedData);
    }
  }, [nnData, selectedData, clickedGrad, glowingEle]);

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

  const onGradArrowClick = (id) => {
    // console.log("grad clicked", id);
    setClickedGrad(id);
  };
  const onPathHover = (id) => {
    // console.log("NN2 got path hover", id);
    if (id) {
      setGlowingEle(paths[id[4]]);
    }
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
          {/* <Background bgColor="#222222" variant={BackgroundVariant.Dots} /> */}
          {/* <Background /> */}
        </ReactFlow>
      </div>
    </ReactFlowProvider>
  );
};

export default NN2;
