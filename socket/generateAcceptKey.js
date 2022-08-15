const crypto = require("crypto");
const magicString = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";

function generateAcceptKey(acceptKey) {
  return crypto
    .createHash("sha1")
    .update(acceptKey + magicString)
    .digest("base64");
}

module.exports = generateAcceptKey;
