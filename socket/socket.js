const decryptBuffer = require("./decryptBuffer.js");
const generateAcceptKey = require("./generateAcceptKey");
const sendMessage = require("./sendMessage.js");
const prepareMsg = require("./prepareMsg.js");
const concat = require("./concat.js");

const handleSocket = (req, socket, head) => {
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
    // FIRST BTYE -> FIN PACHET , OPTCODE and other
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
};

module.exports = handleSocket;
