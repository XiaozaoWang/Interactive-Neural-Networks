// App.jsx

import { useState } from "react";
import { tw } from "twind"; // For Tailwind CSS (or Twind)

const QuestionAnswer = ({ question, answer, state }) => {
  const [isOpen, setIsOpen] = useState(state);

  return (
    <div className={tw`border-b border-gray-300 py-4`}>
      <div
        className={tw`cursor-pointer text-lg font-semibold text-blue-600 bg-blue-100 p-4 rounded-lg`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {question}
      </div>
      {isOpen && (
        <div className={tw`mt-4 p-8 text-gray-700 bg-gray-50 rounded-lg`}>
          {answer}
        </div>
      )}
    </div>
  );
};

// const Article = () => {
//   return (
//     <div className={tw`max-w-2xl mx-auto p-6`}>
//       <h1 className={tw`text-2xl font-bold text-center mb-8`}>
//         Neural Networks Q&A
//       </h1>

//       <QuestionAnswer
//         question="Q: Why do we need neural networks?"
//         answer={
//           <p>
//             Imagine you’re trying to teach a computer how to recognize a picture
//             of a dog. In traditional programming, we’d have to write down all
//             the specific rules that define a "dog." But the problem is, dogs
//             come in all shapes, sizes, and colors. Writing rules to account for
//             all these possibilities becomes too complicated. Machine learning,
//             however, can learn from thousands of examples and figure out what
//             makes a dog look like a dog.
//             <br />
//             <br />
//             <strong>Supervised learning</strong> is where we give the computer
//             both the input (a picture of a dog) and the correct answer (label:
//             “dog”). Over time, the computer gets better at recognizing new
//             examples.
//           </p>
//         }
//       />

//       <QuestionAnswer
//         question="Q: What are neural networks? What is their relationship with machine learning?"
//         answer={
//           <p>
//             A neural network is a simplified model of how our brain works. It
//             consists of artificial neurons connected in layers. These neurons
//             take in data, process it, and make predictions based on what they’ve
//             learned. Neural networks are the backbone of modern machine
//             learning. They allow computers to learn from examples instead of
//             following rigid, predefined rules.
//           </p>
//         }
//       />

//       <QuestionAnswer
//         question="Q: What does a neural network do?"
//         answer={
//           <p>
//             A neural network takes in **features** (like the shape and color of
//             a bird), makes a **prediction** (like "sparrow" or "robin"), and
//             then checks if the guess was right or wrong. If wrong, it adjusts
//             and learns from its mistake. Over time, it improves its predictions
//             by analyzing patterns in the input data.
//           </p>
//         }
//       />

//       <QuestionAnswer
//         question="Q: How does a single node predict?"
//         answer={
//           <p>
//             A single node (perceptron) receives multiple inputs, applies
//             **weights** to each input, adds them up, and then processes the
//             result through an **activation function**. This function helps the
//             node make decisions. The output is then passed on to the next layer,
//             and the process continues. Activation functions introduce complexity
//             and allow the network to learn from mistakes, improving its
//             predictions.
//           </p>
//         }
//       />
//     </div>
//   );
// };

// export default Article;
export default QuestionAnswer;
