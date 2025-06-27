const WebSocket = require("ws");
const http = require("http");

// Create an HTTP server
const server = http.createServer();
const wss = new WebSocket.Server({ server });

const clients = new Set();

wss.on("connection", (ws, req) => {
    const clientIP = req.socket.remoteAddress;
    console.log(`Client connected: ${clientIP}`);
    clients.add(ws);

    ws.on("message", (message) => {
        console.log(`Message from ${clientIP}: ${message}`);

        clients.forEach(client => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });

    ws.on("close", () => {
        console.log(`Client disconnected: ${clientIP}`);
        clients.delete(ws);
    });

    ws.on("error", (err) => {
        console.error(`WebSocket error from ${clientIP}:`, err.message);
    });
});

// Start the server on a specific IP (get your local IP for LAN connections)
const PORT = 3000;
const HOST = "0.0.0.0"; // Accept connections from any network device

server.listen(PORT, HOST, () => {
    console.log(`WebSocket server running on ws://${HOST}:${PORT}`);
});
