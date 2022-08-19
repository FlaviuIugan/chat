const { createServer } = require("node:http");
const express = require("express");
const crypto = require("crypto");
const { Console } = require("node:console");
const { off } = require("node:process");
const handleSocket = require("./socket/socket.js");
const exp = require("node:constants");
const connectDb = require("./db/db.js");
const usersRoute = require("./routes/users.js");
const loginRoute = require("./routes/loginRoute.js");
const auth = require("./middleware/auth.js");

const magicString = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";

const app = express();
// MDN DECRYPT FUNCTION
connectDb();
app.use(express.json());
//app.use(express.static(__dirname + "/front" + "/public"));

const server = createServer(app).listen("1337", () => {
  console.log("web server is running...");
});

server.on("upgrade", handleSocket);

app.use("/api/users", usersRoute);
app.use("/api/login", loginRoute);

app.get("/", auth, (req, res) => {
  res.json("Hello");
  // res.sendFile("index.html");
});

process.on("uncaughtException", (err) => {
  console.error("something bad ...", err.stack);
});

process.on("unhandledRejection", (err) => {
  console.error("something bad ...", err.stack);
});
