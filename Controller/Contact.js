const { default: mongoose } = require("mongoose");
const { UserModal } = require("../Models/userModal");
const {
  customerContactResponse,
  adminContactResponse,
} = require("../Helpers/EmailsToSend");
const { contactSchema } = require("../Models/ContactModel");

const postConatctForm = async (req, res) => {
  const type = req.collectionType;
  const { siteLogo, ...remain } = req.body;

  try {
    const admin = await UserModal.findOne({ brandName: type });
    const ContactModel = mongoose.model(
      type + "_contactForm",
      contactSchema,
      type + "_contactForm",
    );

    const contactForm = new ContactModel(remain);

    await contactForm.save();
    await customerContactResponse(
      admin.toObject(),
      contactForm.email,
      siteLogo,
      contactForm,
    );
    await adminContactResponse(
      admin.toObject(),
      admin.email,
      siteLogo,
      contactForm,
    );

    return res.status(200).json({ message: "Contact Form Submitted" });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ message: "Error occurred while submitting" });
  }
};

const getConatctForm = async (req, res) => {
  const type = req.collectionType;

  try {
    const ContactModel = mongoose.model(
      type + "_contactForm",
      contactSchema,
      type + "_contactForm",
    );

    const contactForms = await ContactModel.find();
    return res
      .status(200)
      .json({ message: "successfully Fetched", data: contactForms });
  } catch (e) {
    console.log(e);

    return res
      .status(500)
      .json({ message: "error occuring while fetching Forms" });
  }
};

module.exports = { postConatctForm, getConatctForm };
