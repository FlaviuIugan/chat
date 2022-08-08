const { createServer } = require("node:http");
const crypto = require("crypto");
const { Console } = require("node:console");
const { off } = require("node:process");

const magicString = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";
function decryptBuffer(encodedData, maskKey) {
  const finalBuffer = Buffer.from(encodedData);
  for (let i = 0; i < finalBuffer.length; i++) {
    finalBuffer[i] = finalBuffer[i] ^ maskKey[i % 4];
  }
  return finalBuffer;
}

function generateAcceptKey(acceptKey) {
  return crypto
    .createHash("sha1")
    .update(acceptKey + magicString)
    .digest("base64");
}

function sendMessage(msg, socket) {
  // fin
  // Opcode
  const data = prepareMsg(msg);

  socket.write(data);
}

function prepareMsg(message) {
  const msg = Buffer.from(message);
  const payloadLength = msg.length;

  let dataFrameBuffer;

  const firstByte = 0x80 | 0x01;

  if (payloadLength <= 125) {
    const bytes = [firstByte];
    dataFrameBuffer = Buffer.from(bytes.concat(payloadLength));
  } else if (payloadLength <= 2 ** 16) {
    const offset = 4;
    const target = Buffer.allocUnsafe(offset);
    target[0] = firstByte;
    target[1] = 126 | 0x0; // just to know the mask

    target.writeUint16BE(payloadLength, 2); // content lenght is 2 bytes
    dataFrameBuffer = target;
  } else {
    throw new Error("Message is to long");
  }

  const totalLength = dataFrameBuffer.byteLength + payloadLength;

  const dataFrameResposne = concat([dataFrameBuffer, msg], totalLength);
  return dataFrameResposne;
  // OP CODE TEXT : 0x01
}
function concat(bufferList, totalLength) {
  const target = Buffer.allocUnsafe(totalLength);
  let offset = 0;
  for (const buffer of bufferList) {
    target.set(buffer, offset);
    offset += buffer.length;
  }
  return target;
}

const server = createServer((req, res) => {
  res.writeHead(200);
  res.end("HELLO");
}).listen("1337", () => {
  console.log("web server is running...");
});

server.on("upgrade", (req, socket, head) => {
  const { "sec-websocket-key": webClientSocketKey } = req.headers;

  const secWebSocketAccept = generateAcceptKey(webClientSocketKey);

  const responseHeaders = [
    "HTTP/1.1 101 Switching Protocols",
    "Upgrade: websocket",
    "Connection: Upgrade",
    `Sec-WebSocket-Accept: ${secWebSocketAccept}`,
    "",
  ]
    .map((line) => line.concat("\r\n"))
    .join("");

  socket.write(responseHeaders);
  console.log(`${webClientSocketKey}  has join`);

  socket.on("readable", () => {
    // FIRST BTYE -> FIN PACHET , OPTCODE and other shit
    // consume optcode ( first byte );
    socket.read(1);

    // SECOND BYTE -> MASK INDICATOR -> if client send to server always 1;
    // PAYLOAD LENGTH -> rest of 7 bits ????

    // consume second byte;
    const [maskAndPayloadLength] = socket.read(1);

    // REMOVE THE FIRST BIT -> MASK BIT
    // "10000000" -> FIRST BITE ALWAYS ONE - mask bit OR 128

    // REST IS THE LENGTH OF THE MESSAGE

    // lengthOfPayload in bits
    const lengthOfPayload = maskAndPayloadLength - 128;

    //if  mask key is 1 => decrypt mask key => all 4 bytes

    let encodedMessage;
    console.log(lengthOfPayload);
    // IF VALUE <= 125 -> 7bits payload

    if (lengthOfPayload <= 125) {
      // rest of the remaining frame is the encoded message
      encodedMessage = socket.read(lengthOfPayload);
    } else if (lengthOfPayload === 126) {
      encodedMessage = socket.read(2).readUint16BE(0);
    } else {
      throw new Error(
        `your message is too long! we don't handle 64-bit messages`
      );
    }
    // MDN ALGO TO DECRYPT THE MESSAGE
    const encrypted_masked = socket.read(4);
    const encoded = socket.read(encodedMessage);
    const decoded = decryptBuffer(encoded, encrypted_masked);
    console.log(decoded.toString("utf8"));
    // IF VALUE == 126; 16-bit unsinged interger are the length
    // 16bits payload
    // IF VALUE >= 127 ; 8bytes , 64-bit unsigned integer
    // 60bits payload

    sendMessage(decoded, socket);
  });
});

process.on("uncaughtException", (err) => {
  console.error("something bad ...", err.stack);
});

process.on("unhandledRejection", (err) => {
  console.error("something bad ...", err.stack);
});
