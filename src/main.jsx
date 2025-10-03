import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SocketProvider } from "./SocketProvider";
import App from "./App.jsx";
import NYPre from "./NYPre.jsx";
import Test from "./test/Test.jsx";
import PageA from "./pages/PageA.jsx";
import PageB from "./pages/PageB.jsx";
import PageC from "./pages/PageC.jsx";
// import App2 from "./test/App2.jsx";
// import Svg from "./test/Svg.jsx";
// import GeoGebraApp from "./test/Geo.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <SocketProvider>
      <BrowserRouter>
        <nav>
          <a href="/">Home</a> | <a href="/nypre">NYPre</a> |{" "}
          <a href="/test">Test</a> | <a href="/pageA">Page A</a> |{" "}
          <a href="/pageB">Page B</a>
        </nav>
        <hr />
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/nypre" element={<NYPre />} />
          <Route path="/test" element={<Test />} />
          <Route path="/pageA" element={<PageA />} />
          <Route path="/pageB" element={<PageB />} />
          <Route path="/pageC" element={<PageC />} />
        </Routes>
      </BrowserRouter>
    </SocketProvider>
  </StrictMode>
);

// createRoot(document.getElementById("root")).render(
//   <StrictMode>
//       {/* <App /> */}
//       <NYPre />
//   </StrictMode>
// );
