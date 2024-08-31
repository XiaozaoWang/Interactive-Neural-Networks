import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
// import App2 from "./test/App2.jsx";
// import Svg from "./test/Svg.jsx";
// import GeoGebraApp from "./test/Geo.jsx";
import Test from "./test/Test.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
    {/* <Svg /> */}
    {/* <GeoGebraApp /> */}
    {/* <Test /> */}
  </StrictMode>
);
