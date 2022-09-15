const mongoose = require("mongoose");

const UserSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },

  password: {
    type: String,
    required: true,
  },

  // friends: {
  //   user: mongoose.Schema.Types.ObjectId,
  //   ref: UserSchema,
  // },

  // messages : {} ?
});

module.exports = mongoose.model("User", UserSchema);
