// server.js (updated)
import express from "express";
import http from "http";
import path from "path";
import { Server } from "socket.io";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

// const io = new Server(server, {
//   cors: { origin: ["http://localhost:5173"], methods: ["GET", "POST"] },
// });

// 修改 Socket.IO 配置，允许局域网连接
// const io = new Server(server, {
//   cors: {
//     origin: ["http://localhost:5173", "http://10.209.78.97:5173"], // 添加你的IP
//     methods: ["GET", "POST"],
//   },
// });

const io = new Server(server, {
  cors: {
    origin: "*", // 临时设置为 * 进行测试
    methods: ["GET", "POST"],
    credentials: false,
  },
  // 添加这些配置以改善兼容性
  allowEIO3: true, // 允许 Engine.IO v3 客户端
  connectionStateRecovery: {
    // 启用连接状态恢复
    maxDisconnectionDuration: 2 * 60 * 1000,
    skipMiddlewares: true,
  },
  // 强制使用所有可用传输
  transports: ["websocket", "polling"],
});

const PORT = process.env.PORT || 4000;


// ------------- Global State -------------
const currentState = {
  page1: { selectedIndex: 0, inputData: [0, 0], targetData: 1 },
  page2: { prediction: 0, target: 1 },
  // ... other parameters
};

// ------------- Socket Logic -------------
io.on("connection", (socket) => {
  console.log("socket connected", socket.id);

  // Send current state to new client
  socket.emit("initialState", currentState);

  // Page 1 to Page 2 communication
  socket.on("page1ToPage2", (data) => {
    currentState.page1 = data;
    socket.broadcast.emit("page1ToPage2", data);
    console.log("page1ToPage2", data);
  });

  // Page 2 to Page 3 communication
  socket.on("page2ToPage3", (data) => {
    currentState.page2 = data;
    socket.broadcast.emit("page2ToPage3", data);
    console.log("page2ToPage3", data);
  });

  // Page 2 requests data from Page 1
  socket.on("page2RequestData", () => {
    socket.broadcast.emit("page2RequestData");
    console.log("page2RequestData");
  });

  // Existing paramChange and toArduino handlers
  socket.on("paramChange", (data) => {
    setByPath(currentState, data.path, data.value);
    socket.broadcast.emit("paramChange", data);
    console.log("paramChange", data);
  });
  socket.on("trainOnce", () => {
    // Broadcast to all other clients (mainly Page2)
    socket.broadcast.emit("trainOnce");
    console.log("trainOnce requested");
  });

  // ADD THIS: Handle updateParams event
  socket.on("updateParams", (data) => {
    // Broadcast updated parameters to all other clients (mainly Page3)
    socket.broadcast.emit("updateParams", data);
    console.log("updateParams", data);
  });

  socket.on("gradientsUpdate", (data) => {
    socket.broadcast.emit("gradientsUpdate", data);
    console.log("gradientsUpdate", data);
  });

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

// Helper function
function setByPath(obj, path, value) {
  const parts = path.split(".");
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!cur[parts[i]]) cur[parts[i]] = {};
    cur = cur[parts[i]];
  }
  cur[parts[parts.length - 1]] = value;
}

// ------------- Arduino Serial (optional) -------------
// let arduinoPort = null;
// try {
//   const { SerialPort } = await import("serialport");
//   const { ReadlineParser } = await import("@serialport/parser-readline");

//   const PORT_PATH = process.env.ARDUINO_PORT || "COM9";
//   const BAUD = parseInt(process.env.ARDUINO_BAUD || "9600");

//   arduinoPort = new SerialPort({ path: PORT_PATH, baudRate: BAUD });
//   const parser = arduinoPort.pipe(new ReadlineParser({ delimiter: "\n" }));

//   // parser.on("data", (line) => {
//   //   try {
//   //     const d = JSON.parse(line);
//   //     if (d.slider !== undefined) {
//   //       currentState.sliders.alpha = d.slider;
//   //       io.emit("paramChange", { path: "sliders.alpha", value: d.slider });
//   //     }
//   //     io.emit("arduinoData", d);
//   //   } catch (e) {
//   //     io.emit("arduinoRaw", line);
//   //   }
//   // });

//   parser.on("data", (line) => {
//     console.log("🔵 [RAW from Arduino]:", line.trim());

//     try {
//       const d = JSON.parse(line);
//       console.log("🟢 [Parsed JSON]:", d);

//       if (d.slider !== undefined) {
//         currentState.sliders = currentState.sliders || {};
//         currentState.sliders.alpha = d.slider;
//         io.emit("paramChange", { path: "sliders.alpha", value: d.slider });
//       }

//       io.emit("arduinoData", d);
//     } catch (e) {
//       console.warn("⚠️ [Invalid JSON or partial line]:", line);
//       io.emit("arduinoRaw", line);
//     }
//   });

//   arduinoPort.on("open", () =>
//     console.log("Arduino serial opened", PORT_PATH, BAUD)
//   );
//   arduinoPort.on("error", (err) => console.error("Serial error", err));
// } catch (e) {
//   console.log(
//     "serialport not installed or failed to init — continuing without Arduino bridge"
//   );
// }

// ------------- Arduino Serial (improved for macOS) -------------
let arduinoPort = null;

async function initializeArduino() {
  try {
    const { SerialPort } = await import("serialport");
    const { ReadlineParser } = await import("@serialport/parser-readline");

    console.log("🔍 Initializing Arduino connection...");
    
    // 自动检测函数
    async function findArduinoPort() {
      try {
        const { SerialPort: SerialPortLib } = await import('serialport');
        const ports = await SerialPortLib.list();
        
        console.log('📋 Available serial ports:');
        ports.forEach(port => {
          console.log(`   - ${port.path} | ${port.manufacturer || 'Unknown'}`);
        });

        const arduinoPorts = ports.filter(port => 
          port.path.includes('usbmodem') || 
          port.path.includes('tty.usbmodem') ||
          port.path.includes('cu.usbmodem') ||
          port.manufacturer?.includes('Arduino')
        );

        return arduinoPorts.length > 0 ? arduinoPorts[0].path : null;
      } catch (error) {
        console.error('Error listing ports:', error);
        return null;
      }
    }

    // 确定端口
    let PORT_PATH = process.env.ARDUINO_PORT;
    if (!PORT_PATH) {
      PORT_PATH = await findArduinoPort() || "/dev/cu.usbmodem14101";
    }
    
    const BAUD = parseInt(process.env.ARDUINO_BAUD || "9600");

    console.log(`🚀 Connecting to Arduino: ${PORT_PATH} at ${BAUD} baud`);

    arduinoPort = new SerialPort({ 
      path: PORT_PATH, 
      baudRate: BAUD,
      autoOpen: false
    });

    const parser = arduinoPort.pipe(new ReadlineParser({ delimiter: "\n" }));

    parser.on("data", (line) => {
      console.log("🔵 [Arduino]:", line.trim());
      try {
        const d = JSON.parse(line);
        console.log("🟢 [Parsed]:", d);
        
        if (d.slider !== undefined) {
          currentState.sliders = currentState.sliders || {};
          currentState.sliders.alpha = d.slider;
          io.emit("paramChange", { path: "sliders.alpha", value: d.slider });
        }
        io.emit("arduinoData", d);
      } catch (e) {
        io.emit("arduinoRaw", line);
      }
    });

    // 手动打开端口
    arduinoPort.open((err) => {
      if (err) {
        console.error(`❌ Failed to open ${PORT_PATH}:`, err.message);
        arduinoPort = null;
      } else {
        console.log(`✅ Arduino connected: ${PORT_PATH}`);
      }
    });

    arduinoPort.on("error", (err) => {
      console.error("💥 Serial error:", err.message);
      arduinoPort = null;
    });

  } catch (e) {
    console.log("❌ Serialport initialization failed:", e.message);
    console.log("💡 Run: npm install serialport @serialport/parser-readline");
  }
}

// 初始化 Arduino 连接
initializeArduino();

// ------------- Production Setup -------------
if (process.env.NODE_ENV === "production") {
  const distPath = path.join(__dirname, "dist");
  app.use(express.static(distPath));
  app.get("*", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

// server.listen(PORT, () => {
//   console.log(`Server listening on ${PORT}`);
// });

// 修改服务器监听配置
server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📍 Local: http://localhost:${PORT}`);
  // console.log(`🌐 Network: http://10.209.78.97:${PORT}`);
  console.log(`🌐 Network: http://10.209.81.178:${PORT}`);
});

