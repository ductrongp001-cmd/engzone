const { app, BrowserWindow } = require("electron");
const { spawn } = require("child_process");
const path = require("path");
const http = require("http");

let win;
let server;

function startServer() {
  return new Promise((resolve, reject) => {
    const serverPath = path.join(__dirname, "..", "server", "src", "index.ts");
    server = spawn("npx", ["tsx", serverPath], {
      cwd: path.join(__dirname, ".."),
      stdio: ["pipe", "pipe", "pipe"],
      shell: true,
    });

    let resolved = false;

    server.stdout.on("data", (data) => {
      const msg = data.toString();
      console.log("[server]", msg.trimEnd());
      if (!resolved && msg.includes("running on")) {
        resolved = true;
        resolve();
      }
    });

    server.stderr.on("data", (data) => {
      console.error("[server:err]", data.toString().trimEnd());
    });

    server.on("error", reject);
    server.on("exit", (code) => {
      if (!resolved) reject(new Error(`Server exited with code ${code}`));
    });

    // Fallback health check
    const check = () => {
      http.get("http://localhost:3001/api/health", (res) => {
        if (!resolved) { resolved = true; resolve(); }
      }).on("error", () => setTimeout(check, 500));
    };
    setTimeout(check, 1000);
  });
}

app.on("ready", async () => {
  await startServer();
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: { nodeIntegration: false, contextIsolation: true },
    icon: path.join(__dirname, "icon.png"),
  });
  win.loadURL("http://localhost:3001");
});

app.on("window-all-closed", () => {
  if (server) server.kill();
  if (process.platform !== "darwin") app.quit();
});
