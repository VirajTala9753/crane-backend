const User = require('../models/User')
const catchAsync = require('./../utils/catchAsync')
const AppError = require('./../utils/appError')
const Channel = require('./../models/channel.js')
const { ObjectId } = require('mongoose').Types

const filterObj = (obj, ...allowedFields) => {
  const newObj = {}
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el]
  })
  return newObj
}

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find()

  // SEND RESPONSE
  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users,
    },
  })
})

exports.createUser = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  })

  if (!newUser)
    return res.status(400).json({
      status: 'failed',
      message: `Can't create user due to invalid details`,
    })

  res.status(200).json({
    status: 'success',
    user: newUser,
  })
})

exports.updateUser = catchAsync(async (req, res, next) => {
  // 1) Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError('This route is not for password updates. Please use /updateMyPassword.', 400))
  }

  // 2) Filtered out unwanted fields names that are not allowed to be updated
  const filteredBody = filterObj(req.body, 'name', 'email', 'active')

  // 3) Update user document
  const updatedUser = await User.findByIdAndUpdate(req.params.id, filteredBody, {
    new: true,
    runValidators: true,
  })

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  })
})

exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id)

  if (!user)
    return res.status(404).json({
      status: 'failed',
      message: `No User found against id ${req.params.id}`,
    })

  res.status(200).json({
    status: 'success',
    user,
  })
})

exports.deleteUser = catchAsync(async (req, res, next) => {
  const deletedUser = await User.findByIdAndDelete(req.params.id)

  if (!deletedUser)
    return res.status(404).json({
      status: 'failed',
      message: `No User found against id ${req.params.id}`,
    })

  res.status(200).json({
    status: 'success',
    user: deletedUser,
  })
})

exports.searchEmail = catchAsync(async (req, res) => {
  try {
    const { email, channelId } = req.query

    const Searchemail = await User.find({ email: { $regex: email, $options: 'i' } })
    if (!Searchemail.length) {
      return res.json({ msg: 'no match found', status: false })
    }
    // const Dataemail = await Channel.find({ email: { $regex: email, $options: 'i' } })

    const channel = await Channel.findOne({ _id: ObjectId(channelId) })
    console.log(channel)
    console.log(typeof channel.participants[0], 'participant type')
    const filterdUser = Searchemail.filter((user) => {
      return !channel.participants.includes(ObjectId(user._id))
    })
    console.log('filteruser', filterdUser)
    console.log('')

    // if ((Dataemail = Searchemail)) {
    //   return res.json({ msg: 'already use', status: false })
    // }
    return res.json({ status: true, filterdUser })
  } catch (error) {
    console.log(error, 'error')
    return res.json({ error: error })
  }
})

exports.updateId = catchAsync(async (req, res) => {
  try {
    console.log('request body', req.body)
    const { selectedUserId, channelId } = req.body
    console.log('selecctuser', selectedUserId)

    if (!selectedUserId) {
      return res.json({
        msg: 'id is not selecte',
        status: false,
      })
    }
    const updateid = await Channel.findByIdAndUpdate(
      { _id: channelId },
      { $push: { participants: ObjectId(selectedUserId) } }
    )
    console.log(updateid, 'updateid')
    return res.json({ status: true })
  } catch (error) {
    console.log(error, 'error')
    return res.json({ error: error })
  }
})
