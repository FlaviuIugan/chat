function decryptBuffer(encodedData, maskKey) {
  const finalBuffer = Buffer.from(encodedData);
  for (let i = 0; i < finalBuffer.length; i++) {
    finalBuffer[i] = finalBuffer[i] ^ maskKey[i % 4];
  }
  return finalBuffer;
}

module.exports = decryptBuffer;
