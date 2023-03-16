const express = require('express')
const { ObjectId } = require('mongoose').Types
const Message = require('../models/message')
const router = express.Router()
const he = require('he')

router.get('/message', async (req, res) => {

  const query = { status: 'active' }
  const ids = []

  if (req?.query?.channelId.length) ids.push(ObjectId(req.query.channelId))

  if (req?.query?.senderId) ids.push(ObjectId(req.query.senderId))

  if (req?.query?.receiverId) ids.push(ObjectId(req.query.receiverId))
  console.log('🚀 ~ router.get ~ ids', ids)

  if (ids.length && req?.query?.channelId.length) {
    query.$and = [{ channelId: req.query.channelId }]
  } else {
    query.$or = [
      {
        senderId: req.query.senderId,
        receiverId: req.query.receiverId,
      },
      {
        senderId: req.query.receiverId,
        receiverId: req.query.senderId,
      },
    ]
  }

  // { $or: [{ senderId: req.query.senderId }, { senderId: req.query.receiverId }] },
  // { $or: [{ receiverId: req.query.senderId }, { receiverId: req.query.receiverId }] },
  console.log('🚀 ~ router.get ~ query', JSON.stringify(query))
  const allMessageCollection = await Message.find(query).lean()
  // aanathi have jo yagnesh logged in user hoy and piyush ne view karto hoy to only eva messages
  // aavva joiye je kaa to yagnesh kaa to piyush e send krya hoy.
  // ok
  res.status(200).send({
    status: 'success',
    data: allMessageCollection,
  })
})

router.post('/message', async (req, res) => {
  try {
    if (!req.body?.message?.trim()) {
      return res.status(400).send({ message: 'Enter Message' })
    }
    const { message, senderId, receiverId, channelId, localId } = req.body
    let isChannelMessage = false

    const decodedMessage = he.decode(message || '')
    const msgData = { message: decodedMessage, senderId }
    if (receiverId) msgData.receiverId = ObjectId(receiverId)
    if (channelId) {
      isChannelMessage = true
      msgData.channelId = ObjectId(channelId)
    }
    const newMessage = await new Message(msgData)
    await newMessage.save()

    io.emit('message', { message: newMessage, isChannelMessage, localId, action: 'create' })
    res.status(201).send({
      success: 'message send',
      _id: newMessage._id,
    })
  } catch (error) {
    res.status(500).send(error)
  }
})

router.put('/message', async (req, res) => {
  if (!req.body._id && !req.body.message.trim()) {
    return res.status(400).send({ message: 'Enter Message' })
  }
  const { message, _id, localId } = req.body
  const decodedMessage = he.decode(message || '')

  const existingMessage = await Message.findOne({ _id })
  if (!existingMessage)
    return res.status(404).send({
      status: 'failed',
      message: `No message found`,
    })

  existingMessage.message = decodedMessage
  await existingMessage.save()

  io.emit('message', { message: existingMessage, isChannelMessage: !!existingMessage.channelId, localId, action: 'update' })
  res.status(200).send({
    success: 'success',
    message: 'message updated',
  })
})

router.delete('/message', async (req, res) => {
  if (!req.query.id) {
    return res.status(400).send({ message: 'message id not found' })
  }

  const existingMessage = await Message.findOne({ _id: req.query.id })

  if (!existingMessage)
    return res.status(404).send({
      status: 'failed',
      message: `No message found`,
    })

  existingMessage.status = 'deleted'
  await existingMessage.save()

  io.emit('message', {
    message: existingMessage,
    isChannelMessage: !!existingMessage.channelId,
    localId: req.query?.localId,
    action: 'delete',
  })

  res.status(200).send({
    success: 'success',
  })
})

module.exports = router
