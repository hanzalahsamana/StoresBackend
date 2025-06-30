const { mongoose } = require("mongoose");
const subscriberSchema = require("../Models/SubscriberModal");

const addSubscriber = async (req, res) => {
  try {
    const type = req.collectionType;

    console.log(type);

    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    const SubscriberModel = mongoose.model(
      `${type}_subscribers`,
      subscriberSchema,
      `${type}_subscribers`,
    );

    const alreadyExists = await SubscriberModel.findOne({ email });
    if (alreadyExists) {
      return res.status(409).json({ message: "Email is already subscribed." });
    }

    const newSubscriber = new SubscriberModel({ email });
    await newSubscriber.save();

    return res.status(201).json({ message: "Subscribed successfully." });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      message: "Something went wrong.",
    });
  }
};

module.exports = addSubscriber;
