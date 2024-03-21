import http from "http";
import { startSocket } from "./src/config/socket.config.js";
import { connectMongoDb } from "./src/config/db.config.js";
import { initializeExpress } from "./app.js";

//create express instance
const app = initializeExpress();

//create server based on express
const httpServer = http.createServer(app);

//connect to mongo database
connectMongoDb();

//attaches socket to current port enable listening
startSocket(httpServer);

httpServer.listen(process.env.PORT, () => {
  console.log(`\x1b[36m listening on port ${process.env.PORT}...\x1b[0m`);
});
