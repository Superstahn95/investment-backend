const asyncErrorHandler = require("../utils/asyncErrorHandler");
const CustomError = require("../utils/customError");
const Message = require("../models/Message");

exports.createMessage = asyncErrorHandler(async (req, res, next) => {
  const { phoneNumber, email, name, content } = req.body;
  if (!phoneNumber || !email || !name || !content) {
    const err = new CustomError("Fill all fields", 400);
    return next(err);
  }
  const message = new Message({ phoneNumber, content, email, name });
  await message.save();
  res.status(201).json({
    status: "success",
    message: `Hey ${name} we have received your message and we will get back to you`,
  });
});

exports.getMessages = asyncErrorHandler(async (req, res, next) => {
  const messages = await Message.find().sort({ createdAt: -1 });
  res.status(200).json({
    status: "success",
    messages,
  });
});
