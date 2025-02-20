import React, { useState } from "react";
import { tw } from "twind";

export default function PathFormulaNode({ id, data }) {
  const [highlightedPath, setHighlightedPath] = useState(null);

  //   console.log("path len:  ");
  const handleHover = (pathId) => {
    setHighlightedPath(pathId);
    data.onPathHover(pathId);
  };

  const handleMouseLeave = () => {
    setHighlightedPath(null);
    data.onPathHover(null);
  };

  return (
    <div
      className={tw`p-2 bg-gray-50 border border-gray-100 rounded-md flex cursor-pointer`}
      style={{ visibility: data.allPaths.length > 0 ? "visible" : "hidden" }}
    >
      <span>∆w = - (</span>
      {data.allPaths.map((path, i) => (
        <React.Fragment key={i}>
          <div
            className={tw`flex justify-center px-1 ${
              highlightedPath === `path${i}` ? "bg-yellow-200" : ""
            }`}
            onMouseEnter={() => handleHover(`path${i}`)}
            onMouseLeave={handleMouseLeave}
          >
            {`∂path${i}`}
          </div>
          {i < data.allPaths.length - 1 ? <span> + </span> : null}
        </React.Fragment>
      ))}
      <span>) × lr</span>
    </div>
  );
}
