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

module.exports = prepareMsg;
