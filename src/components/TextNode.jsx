import React, { useState, useEffect, useRef } from "react";
import { Handle, Position } from "@xyflow/react";
import { tw } from "twind";
import * as d3 from "d3";

const TextNode = ({ id, data }) => {
  const text = data.text;
  return (
    <>
      <div className={tw`p-0 m-0 bg-gray-50 border border-gray-100 rounded-md`}>
        {text}
      </div>
    </>
  );
};

export default TextNode;
