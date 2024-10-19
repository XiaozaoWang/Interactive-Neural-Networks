import React, { useState, useEffect, useRef } from "react";
import { Handle, Position } from "@xyflow/react";
import { tw } from "twind";

const ButtonNode = ({ id, data }) => {
  const text = data.text;
  return (
    <>
      <div className={tw`p-0 m-0 bg-gray-50 border border-gray-100 rounded-md`}>
        <button
          className={tw`px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700`}
          onClick={() => {
            console.log("ButtonNode: handleClick");
            data.handleClick();
          }}
        >
          {text}
        </button>
      </div>
    </>
  );
};

export default ButtonNode;
