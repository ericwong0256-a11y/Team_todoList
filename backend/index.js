const { createServer } = require("node:http");
const { Server } = require("socket.io");

const PORT = Number(process.env.SOCKET_PORT || 3001);
const httpServer = createServer();
const io = new Server(httpServer, {
  cors: { origin: "*" }
});

io.on("connection", (socket) => {
  socket.on("workspace:join", (workspaceId) => socket.join(workspaceId));
  socket.on("task:updated", ({ workspaceId, payload }) => {
    socket.to(workspaceId).emit("task:updated", payload);
  });
});

httpServer.listen(PORT, () => {
  console.log(`Socket server running on http://localhost:${PORT}`);
});
