import { createServer } from "node:http";
import { Server } from "socket.io";

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: { origin: "*" }
});

io.on("connection", (socket) => {
  socket.on("workspace:join", (workspaceId: string) => socket.join(workspaceId));
  socket.on("task:updated", ({ workspaceId, payload }) => {
    socket.to(workspaceId).emit("task:updated", payload);
  });
  socket.on("disconnect", () => {});
});

httpServer.listen(3001, () => {
  console.log("Socket server running on http://localhost:3001");
});
