const { createServer } = require("node:http");
const crypto = require("crypto");
const { Console } = require("node:console");
const { off } = require("node:process");
const handleSocket = require("./socket/socket.js");

const magicString = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";

// MDN DECRYPT FUNCTION

const server = createServer((req, res) => {
  res.writeHead(200);
  res.end("HELLO");
}).listen("1337", () => {
  console.log("web server is running...");
});

server.on("upgrade", handleSocket);

process.on("uncaughtException", (err) => {
  console.error("something bad ...", err.stack);
});

process.on("unhandledRejection", (err) => {
  console.error("something bad ...", err.stack);
});
