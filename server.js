// server.js (ESM 版)
import express from "express";
import http from "http";
import path from "path";
import { Server } from "socket.io";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: ["http://localhost:5173"], methods: ["GET", "POST"] }, // Vite dev origin
});

const PORT = process.env.PORT || 4000;

// ------------- 全局状态（简单的单实例 state） -------------
const currentState = {
  sliders: { alpha: 0.5, beta: 0.2 },
  buttons: { play: false },
  // ...你想同步的任何参数
};

// ------------- socket 逻辑 -------------
io.on("connection", (socket) => {
  console.log("socket connected", socket.id);

  // 连接时把当前 state 发给新客户端
  socket.emit("initialState", currentState);

  // 来自页面的参数变更
  socket.on("paramChange", (data) => {
    // data = { path: 'sliders.alpha', value: 0.72 }
    setByPath(currentState, data.path, data.value);
    // 把变动广播给除了发起者之外的所有客户端（避免回环）
    socket.broadcast.emit("paramChange", data);
    console.log("paramChange", data);
  });

  // 客户端想写回 Arduino
  socket.on("toArduino", (cmd) => {
    if (arduinoPort && arduinoPort.isOpen) {
      arduinoPort.write(JSON.stringify(cmd) + "\n");
    } else {
      console.log("toArduino dropped, no port open", cmd);
    }
  });

  socket.on("disconnect", () => {
    console.log("socket disconnected", socket.id);
  });
});

// helper: 支持用 "a.b.c" 路径更新 currentState
function setByPath(obj, path, value) {
  const parts = path.split(".");
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!cur[parts[i]]) cur[parts[i]] = {};
    cur = cur[parts[i]];
  }
  cur[parts[parts.length - 1]] = value;
}

// ------------- Arduino 串口（可选） -------------
// 需要安装: npm i serialport @serialport/parser-readline
let arduinoPort = null;
try {
  const { SerialPort } = await import("serialport");
  const { ReadlineParser } = await import("@serialport/parser-readline");

  const PORT_PATH = process.env.ARDUINO_PORT || "COM9"; // Windows 示例
  const BAUD = parseInt(process.env.ARDUINO_BAUD || "9600");

  arduinoPort = new SerialPort({ path: PORT_PATH, baudRate: BAUD });
  const parser = arduinoPort.pipe(new ReadlineParser({ delimiter: "\n" }));

  parser.on("data", (line) => {
    // console.log("got serial line", line);
    try {
      const d = JSON.parse(line);
      // 假设 d = { slider: 123 }
      if (d.slider !== undefined) {
        currentState.sliders.alpha = d.slider; // 存到全局状态
        io.emit("paramChange", { path: "sliders.alpha", value: d.slider });
      }
      // 还可以广播原始 Arduino 数据
      io.emit("arduinoData", d);
      //   console.log("arduinoData", d);
    } catch (e) {
      io.emit("arduinoRaw", line);
      //   console.log("arduinoRaw", line);
    }
  });

  arduinoPort.on("open", () =>
    console.log("Arduino serial opened", PORT_PATH, BAUD)
  );
  arduinoPort.on("error", (err) => console.error("Serial error", err));
} catch (e) {
  console.log(
    "serialport not installed or failed to init — continuing without Arduino bridge"
  );
}

// ------------- production: serve built React if exists -------------
if (process.env.NODE_ENV === "production") {
  const distPath = path.join(__dirname, "dist");
  app.use(express.static(distPath));
  app.get("*", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

server.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
