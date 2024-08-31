import React, { useState, useRef, useEffect } from "react";
import { useSpring, animated } from "@react-spring/web";

function useInterval(callback, delay) {
  // Creating a ref
  const savedCallback = useRef();

  // To remember the latest callback .
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // combining the setInterval and
  //clearInterval methods based on delay.
  useEffect(() => {
    function func() {
      savedCallback.current();
    }
    if (delay !== null) {
      let id = setInterval(func, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

const Svg = () => {
  function generateCircles() {
    // randomly select 4 numbers from the array [0, 1, 2, 3, 4, 5]
    const arr = [0, 1, 2, 3, 4, 5];
    const randomNumbers = [];
    for (let i = 0; i < 4; i++) {
      const randomIndex = Math.floor(Math.random() * arr.length);
      randomNumbers.push(arr[randomIndex]);
      arr.splice(randomIndex, 1);
    }
    return randomNumbers;
  }
  const [visibleCircles, setVisibleCircles] = useState(generateCircles());
  useInterval(() => {
    setVisibleCircles(generateCircles());
  }, 2000);
  return (
    <svg viewBox="0 0 100 20">
      {allCircles.map((d) => (
        <AnimatedCircle
          key={d}
          index={d}
          isShowing={visibleCircles.includes(d)}
        />
      ))}
    </svg>
  );
};

const AnimatedCircle = ({ index, isShowing }) => {
  const wasShowing = useRef(false);
  useEffect(() => {
    wasShowing.current = isShowing;
  }, [isShowing]);
  const style = useSpring({
    config: {
      duration: 1200,
    },
    r: isShowing ? 6 : 0,
    opacity: isShowing ? 1 : 0,
  });
  return (
    <animated.circle
      {...style}
      cx={index * 15 + 10}
      cy="10"
      fill={
        !isShowing
          ? "tomato"
          : !wasShowing.current
          ? "cornflowerblue"
          : "lightgrey"
      }
    />
  );
};

export default Svg;
