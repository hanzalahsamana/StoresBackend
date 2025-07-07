const { SubscriberModel } = require("../Models/SubscriberModal");

const addSubscriber = async (req, res) => {
  try {
    const { storeId } = req.params
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    const alreadyExists = await SubscriberModel.findOne({ email });
    if (alreadyExists) {
      return res.status(409).json({ message: "Email is already subscribed." });
    }

    const newSubscriber = new SubscriberModel({ email, storeRef: storeId });
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
