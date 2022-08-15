function sendMessage(msg, socket) {
  // fin
  // Opcode
  const data = prepareMsg(msg);

  socket.write(data);
}
module.exports = sendMessage;
