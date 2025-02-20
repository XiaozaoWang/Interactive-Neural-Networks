import React, { useState, useEffect, useRef } from "react";
import { Handle, Position } from "@xyflow/react";
import { tw } from "twind";

export default function FormulaNode({ id, data }) {
  const [highlightedId, setHighlightedId] = useState(null);
  const handleHover = (id) => {
    // console.log("hovering", id);
    setHighlightedId(id);
    data.onParamHover(id);
  };

  const handleMouseLeave = () => {
    setHighlightedId(null);
    data.onParamHover(null);
  };

  return (
    <>
      {
        <div
          className={tw`p-0 m-0 bg-gray-50 border border-gray-100 rounded-md flex cursor-pointer`}
          style={{ visibility: data.clickedGrad ? "visible" : "hidden" }}
        >
          {`∆${data.clickedGrad?.slice(3)}=`}
          <span>-</span>
          {["∂L/∂a", "∂a/∂z", `∂z/∂${data.clickedGrad?.slice(3)}`, "lr"].map(
            (item, i) => (
              <React.Fragment key={i}>
                <div
                  className={tw`flex justify-center px-1 ${
                    highlightedId === `grad${i}` ? "bg-yellow-200" : ""
                  }`}
                  onMouseEnter={() => handleHover(`grad${i}`)}
                  onMouseLeave={handleMouseLeave}
                >
                  {item}
                </div>
                {i < 3 ? <span>×</span> : null}
              </React.Fragment>
            )
          )}
        </div>
      }
    </>
  );
}
