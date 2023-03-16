const mongoose = require('mongoose')
const { ObjectId } = require('mongoose').Types

const messageSchema = new mongoose.Schema({
  channelId: {
    type: ObjectId,
  },
  senderId: {
    type: ObjectId,
  },
  receiverId: {
    type: ObjectId,
  },
  localId: {
    type: String,
  },
  message: {
    type: String,
    required: true,
  },
  messageTime: {
    type: Date,
    default: new Date(),
  },
  status: {
    type: String,
    default: 'active',
  },
})

const Message = mongoose.model('Message', messageSchema)
module.exports = Message
