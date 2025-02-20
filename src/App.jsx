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

const App = () => {
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

      <p>
        This interactive article introduces neural networks in a way that’s
        intuitive to understand, whether you’re a curious mind new to the topic,
        or have used machine learning models but never fully grasped what’s
        going on under the hood.
      </p>
      <br />
      <p>
        It will first dive into the reasoning behind neural network training
        processes. Through a series of thought-provoking questions, it will
        break down complex concepts into simple analogies, and answer why
        certain steps are necessary and what purpose they serve.
      </p>
      <br />
      <p>
        Then it will open up the black box and show you what is exactly
        happening inside neural networks. You will get hands-on with interactive
        components, which operates on a real neural network and allows you to
        adjust parameters, see real-time results, and deepen your understanding
        as you explore. Instead of feeling “disconnected” from the learning
        process of neural networks, I want to give greater control and freedom
        to explore for every audience.
      </p>
      <br />
      <p>
        If you are interested… No previous knowledge of machine learning is
        needed—just start exploring with an open mind and a bit of curiosity!
      </p>
      <br />
      <strong>
        This is a Q&A based and interactive learning journey. Click on questions
        and play with interactive components to explore!{" "}
      </strong>
      <br />
      <QuestionAnswer
        state={false}
        question="Q: What are machine learning and neural networks?"
        answer={
          <>
            <p>WIP</p>
          </>
        }
      />
      <QuestionAnswer
        state={false}
        question="Q: Why do we need machine learning?"
        answer={
          <>
            <p>
              Imagine you’re trying to teach a computer how to recognize a
              picture of a dog. In traditional programming, we’d have to write
              down all the specific rules that define a "dog." We might say,
              “Look for pointy ears, a wagging tail, and fur.” But the problem
              is, dogs come in all shapes, sizes, and colors—some have floppy
              ears, others no tail at all! Writing rules to account for all
              these possibilities would become so complicated that we’d never
              finish.
            </p>
            <br />
            <div className={tw`flex justify-center items-center pl-80 pr-80`}>
              <img src={dogImage} alt="" />
            </div>
            <br />
            <p>
              As you write these rules for the computer, you may find yourself
              writing:
            </p>
            <br />
            <div className={tw`flex justify-center items-center pl-60 pr-60`}>
              <img src={frustration} alt="" />
            </div>
            <br />
            <p>
              So frustrating, isn’t it? Each new rule complicates the program
              further, and you realize that capturing every possible variation
              of a dog becomes an unmanageable task.
            </p>
            <br />
            <p>
              Now think of trying to apply this to something even more complex,
              like recognizing faces. People have different hairstyles, facial
              expressions, and angles. Describing all these with traditional
              programming is like trying to capture the endless possibilities
              with a set of rigid rules—it just doesn’t work.
            </p>
            <br />
            <p>
              But here’s where machine learning comes to the rescue. Instead of
              writing all the rules ourselves, we let the computer learn the
              rules from examples. We show it hundreds, thousands, even millions
              of pictures of dogs, and over time, it figures out what makes a
              dog look like a dog. Machine learning is powerful because it
              doesn’t rely on us manually writing down rules—it learns from
              data.
            </p>
            <br />
            <p>
              In this common practice called Supervised Learning, we give the
              computer both the input (like a picture of a dog) and the correct
              answer (label: “dog”). Over time, the computer looks for patterns,
              learning to match new images with the correct labels. It’s like
              teaching a child by showing them many examples and helping them
              get better with practice.
            </p>
            <br />
            <p>
              Machine learning has transformed many industries by enabling
              computers to learn from data and improve their performance over
              time without explicit programming. For example, machine learning
              improves disease diagnosis by recognizing patterns in medical
              data, identify faces accurately by training on extensive image
              datasets, and enhances chatbots through learning from user
              interactions.
            </p>
          </>
        }
      />
      <QuestionAnswer
        state={false}
        question="Q: What are artificial neural networks?"
        answer={
          <>
            <p>
              Artificial neural networks are a specific type of machine learning
              model inspired by the structure of the human brain.
            </p>
            <br />
            <p>
              In our brain, we have billions of neurons, and they work together
              to take in information, process it, and help us make a decision.
              Every single neuron does the same thing, but on a smaller scale.
              It has branched structures called dendrites that receive signals
              from other neurons. The signals are summed at the cell body
              (soma). If the total excitatory input exceeds a certain threshold,
              an electrical impulse is generated and passed to the next neurons.
            </p>
            <br />
            <p>
              Similar to the real neural networks in the brain, an artificial
              neural network consists of layers of interconnected nodes, or
              artificial neurons, that work together to process information.
              Just like our brain learns from experience, an artificial neural
              network learns from data and constantly adjusts itself to make
              better decisions.
            </p>
            <br />
            <div className={tw`flex justify-center items-center pl-72 pr-72`}>
              <img src={nnann} alt="" />
            </div>
            <p>
              From now, when we discuss the details about artificial neural
              networks, we will use “neural networks” for simplicity. However,
              please bear in mind that we are actually talking about artificial
              neural networks and their difference from the real neural networks
              in brains.
            </p>
          </>
        }
      />
      <QuestionAnswer
        state={false}
        question={"Q: What tasks does a neural network perform?"}
        answer={
          <>
            <p>
              A neural network helps us solve tasks by looking at patterns in
              data. First, we give it some important details (features) about
              the data, and then it tries to guess (make a prediction) based on
              those details. Over time, it learns from its mistakes and gets
              better at making the right predictions.
            </p>
            <br />
            <p>
              Now, let’s understand those process by completing a simple goal:
              Classification of two kinds of dogs.
            </p>
            <br />
            <strong>Features:</strong>
            <br />
            <p>
              Think of features as the characteristics of the dog that we care
              about. For example, <strong>body height</strong> and{" "}
              <strong>fur color</strong> are two features we might use to tell
              apart different kinds of dogs. These features are the input to the
              neural network — the information it uses to make a decision.
            </p>
            <br />
            <strong>Label:</strong>
            <br />
            <p>
              Now, to teach the network how to classify, we also need something
              called a <strong>label</strong>. A label is the correct answer
              that we already know — in this case, whether the dog is a{" "}
              <strong>Samoyed</strong> or a <strong>Dachshund</strong>. The
              label helps the network understand what the right outcome should
              be when it's training.
            </p>
            <br />
            <p>
              Now, here’s everything we know about our data. Each dog, with its
              features and label, becomes a <strong>data point</strong> that the
              network can learn from. Let’s see two of them:
            </p>
            <br />
            <div className={tw`flex justify-center items-center pl-72 pr-72`}>
              <img src={twodogs} alt="" />
            </div>
            <br />
            <p>
              To make the features easier for a neural network to understand, a
              common approach is to map them to numeric values between [-1, 1].
            </p>
            <br />

            <p>
              For example, larger body height might be mapped closer to{" "}
              <strong>1</strong>, and smaller body height closer to{" "}
              <strong>-1</strong>.
            </p>
            <br />

            <p>
              White fur can be represented as <strong>-1</strong>, black fur as{" "}
              <strong>1</strong>, and chocolate fur maybe as{" "}
              <strong>0.8</strong> because it’s somewhere in between white and
              black, but closer to black.
            </p>
            <br />

            <p>
              We can also turn the labels (in our case, type of dog) into
              numbers. Here, we will set Samoyed as <strong>1</strong>, and
              Dachshund as <strong>-1</strong>.
            </p>
            <br />

            <p>
              This process is called <strong>normalization</strong>, and it
              helps the neural network compare features more easily because all
              the numbers are now on a similar scale. By keeping values between{" "}
              <strong>-1</strong> and <strong>1</strong>, we ensure that no
              feature dominates the process just because it has larger numbers.
            </p>
            <br />
            <div className={tw`flex justify-center items-center pl-72 pr-72`}>
              <img src={scale} alt="" />
            </div>
            <br />
            <p>We can then rearrange our data points:</p>
            <br />
            <div className={tw`flex justify-center items-center pl-72 pr-72`}>
              <img src={twodogsnum} alt="" />
            </div>
            <br />
            <br />
            <br />
            <p>
              Select different data points and hit the Train button, and see how
              a neural network learns to predict the type of dog!
            </p>
            <br />
            <div className={tw`flex justify-center items-center`}>
              {/* <InOut /> */}
            </div>
          </>
        }
      />

      <QuestionAnswer
        state={true}
        question="Q: How does a single node predict?"
        answer={
          <>
            <p>
              Let’s adjust the weights to see how they affect the final result.
            </p>
            <br />
            <div className={tw`flex justify-center items-center`}>
              {/* <SinglePredict /> */}
            </div>
            <div className={tw`flex justify-center items-center`}>
              {/* <SingleTrain /> */}
            </div>
            <div className={tw`flex justify-center items-center`}>
              {/* <Activation /> */}
            </div>
          </>
        }
      />

      <QuestionAnswer
        state={true}
        question="Full interactive Neural Network"
        answer={
          <>
            <p className={tw`text-sm font-bold mb-4 text-center text-gray-800`}>
              Instruction for current version: Click "Feed" to pass the input
              data, and click "Train" multiple times to train the network. After
              several training, the Loss value will be reduced greatly.
            </p>
            {/* <button
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
              <option defaultValue="0.02">0.02</option>
            </select> */}

            {/* <div className={tw`flex mt-8 space-x-8`}>
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
            </div> */}

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
          </>
        }
      />
    </div>
  );
};

export default App;
