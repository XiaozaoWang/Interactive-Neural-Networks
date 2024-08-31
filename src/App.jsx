import React, { useState, useEffect } from "react";
import NN from "./NN";
import { mean_squared_error, MLP, Value } from "./micrograd";
import { tw } from "twind";

const App = () => {
  const [mlp, setMlp] = useState(new MLP(3, [3, 1]));
  const [inputs, setInputs] = useState([
    [2.0, 3.0, -1.0],
    [3.0, -1.0, 0.5],
    [0.5, 1.0, 1.0],
    [1.0, 1.0, -1.0],
  ]);
  const [targets, setTargets] = useState([1.0, -1.0, -1.0, 1.0]);
  const [predictions, setPredictions] = useState([]); // plain numbers
  const [loss, setLoss] = useState(new Value(0)); // a Value instance that can propagate back the network
  // extracted data that will be passed to React Flow UI
  const [lastInputData, setLastInputData] = useState([]); // when a batch of samples are passed at once, only display the last sample
  const [nnData, setNnData] = useState([]); // store the w, b, grad, output of non-input neurons layer by layer
  const [step, setStep] = useState(0.2);

  // Initialize the
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

    setNnData(updateNodeData());
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

    setNnData(updateNodeData());
  };

  const handleStepChange = (e) => {
    const step = parseFloat(e.target.value);
    console.log("step changed: ", step);
    setStep(step);
  };

  function updateNodeData() {
    const updatedData = mlp.layers.map((layer) =>
      layer.neurons.map((neuron) => ({
        weights: neuron.w.map((w) => w.data),
        bias: neuron.b.data,
        output: neuron.out.data,
        grad: neuron.b.grad,
      }))
    );
    console.log("updatedData: ", updatedData);
    return updatedData;
  }

  return (
    <div className={tw`p-8 bg-gray-100 min-h-screen`}>
      <h1 className={tw`text-3xl font-bold mb-4 text-center text-gray-800`}>
        Neural Network Visualizer
      </h1>
      <button
        className={tw`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none m-2`}
        onClick={handleFeed}
      >
        Feed
      </button>
      <button
        className={tw`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none m-2`}
        onClick={handleTrain}
      >
        Train
      </button>
      <select onChange={handleStepChange} className={tw`m-2`}>
        <option value="0.2">0.2</option>
        <option value="0.1">0.1</option>
        <option value="0.05">0.05</option>
        <option value="0.02">0.02</option>
      </select>

      <div className={tw`flex mt-8 space-x-8`}>
        <div className={tw`flex-1`}>
          <h2 className={tw`text-xl font-semibold mb-2 text-gray-700`}>
            Predictions:
          </h2>
          {predictions.map((pred, index) => (
            <p key={index} className={tw`text-gray-600`}>
              Output {index + 1}: {pred.toFixed(2)}
            </p>
          ))}
        </div>

        <div className={tw`flex-1`}>
          <h2 className={tw`text-xl font-semibold mb-2 text-gray-700`}>
            Targets:
          </h2>
          {targets.map((t, index) => (
            <p key={index} className={tw`text-gray-600`}>
              Output {index + 1}: {t.toFixed(2)}
            </p>
          ))}
        </div>

        <div className={tw`flex-1`}>
          <h2 className={tw`text-xl font-semibold mb-2 text-gray-700`}>
            Loss:
          </h2>
          <p className={tw`text-gray-600`}>{loss.data.toFixed(2)}</p>
        </div>
      </div>

      <NN nnData={nnData} lastInputData={lastInputData} />
    </div>
  );
};

export default App;
