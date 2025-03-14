import React, { useState, useEffect } from "react";
import QuestionAnswer from "./test/QuestionAnswer";
import { mean_squared_error, MLP, Value } from "./micrograd";
import { tw } from "twind";

// Flows
import NN from "./flows/NN";
import NN2 from "./flows/NN2";
import InOut from "./flows/InOut";
import SinglePredict from "./flows/SinglePredict";
import Activation from "./flows/Activation";
import SingleTrain from "./flows/SingleTrain";

import dogImage from "./images/dogs.jpg";
import frustration from "./images/frustration.png";
import nnann from "./images/nnann.jpg";
import twodogs from "./images/twodogs.png";
import twodogsnum from "./images/twodogsnum.png";
import scale from "./images/scale.png";
import { sum } from "d3";

const NYPre = () => {
  const [mlp, setMlp] = useState(new MLP(3, [3, 1]));
  const [inputs, setInputs] = useState([
    [2.0, 3.0, -1.0],
    [3.0, -1.0, 0.5],
    [0.5, 1.0, 1.0],
    [1.0, 1.0, -1.0],
  ]);
  // const [inputs, setInputs] = useState([
  //   [2.0, 3.0],
  //   // [3.0, -1.0],
  //   // [0.5, 1.0],
  //   // [1.0, 1.0],
  // ]);
  const [targets, setTargets] = useState([1.0, -1.0, -1.0, 1.0]);
  // const [targets, setTargets] = useState([1.0]);
  const [predictions, setPredictions] = useState([]); // plain numbers
  const [loss, setLoss] = useState(new Value(0)); // a Value instance that can propagate back the network
  // extracted data that will be passed to React Flow UI
  const [lastInputData, setLastInputData] = useState([]); // when a batch of samples are passed at once, only display the last sample
  const [nnData, setNnData] = useState([]); // store the w, b, grad, output of non-input neurons layer by layer
  const [step, setStep] = useState(0.2);

  // Initialize nnData
  useEffect(() => {
    setNnData(updateNodeData());
  }, []);

  const handleFeed = () => {
    // log out the data feed
    const ypred = [];
    for (let i in inputs) {
      ypred[i] = mlp.forward(inputs[i]); // a Value instance that is in the graph
    }
    const predictions = ypred.map((y) => y.data); // get plain numbers
    setPredictions(predictions);

    let loss = mean_squared_error(targets, ypred); // a Value instance
    setLoss(loss);

    setLastInputData(inputs[inputs.length - 1]);
  };

  const handleTrain = () => {
    handleFeed(); // sets a new Loss Value every time to prevent error in gradient update
    // zero out grads
    for (let p of mlp.parameters()) {
      p.grad = 0.0;
    }
    loss.backward();
    for (let p of mlp.parameters()) {
      p.data += -1 * p.grad * step;
    }

    setNnData(updateNodeData()); // [!] every time nnData is reset using "setNnData", the child components that takes in nnData will re-render
  };

  const handleStepChange = (e) => {
    const step = parseFloat(e.target.value);
    // console.log("step changed: ", step);
    setStep(step);
  };

  function updateNodeData() {
    const layers = mlp.layers.map((layer) =>
      layer.neurons.map((neuron) => ({
        weights: neuron.w.map((w) => w.data),
        bias: neuron.b.data,
        sum: neuron.sum.data,
        output: neuron.out.data,
        grad: neuron.b.grad,
      }))
    );
    const updatedData = { size: mlp.sz, layers: layers };
    // console.log("updatedData: ", updatedData);
    return updatedData;
  }

  return (
    <div className={tw`pt-12 pb-12 pl-48 pr-48 bg-gray-100`}>
      {/* <div className={tw` bg-gray-100`}> */}
      <h1 className={tw`text-3xl font-bold mb-4 text-center text-gray-800`}>
        Interactive Neural Networks
      </h1>

      <h1
        className={tw`text-xl font-bold mb-4 text-center text-gray-800 pt-12 pb-4`}
      >
        Single Perceptron
      </h1>

      {/* <p className={tw`text-sm text-center text-gray-800`}>Instructions:</p> */}
      <p className={tw`text-sm text-center text-gray-800`}></p>

      <div className={tw`flex justify-center items-center pb-10`}>
        <SingleTrain />
      </div>

      <div className={tw`flex justify-center items-center`}>
        <Activation />
      </div>

      <h1
        className={tw`text-xl font-bold mb-4 text-center text-gray-800 pt-12 pb-4`}
      >
        Neural Network
      </h1>

      {/* <p className={tw`text-sm text-center text-gray-800`}>
        Instruction: Click "Step" multiple times to train the network. After
        several training, the Loss value will be reduced significantly.
      </p> */}

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          height: "400px",
        }}
      >
        {/* <NN nnData={nnData} lastInputData={lastInputData} /> */}
        <NN2 />
      </div>
    </div>
  );
};

export default NYPre;
