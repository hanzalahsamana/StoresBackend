const {
  customerContactResponse,
  adminContactResponse,
} = require("../Helpers/EmailsToSend");
const { ContactModel } = require("../Models/ContactModel");
const { StoreModal } = require("../Models/StoreModal");

const postConatctForm = async (req, res) => {
  const { storeId } = req.params;
  const { siteLogo, ...remain } = req.body;

  try {

    const admin = await StoreModal.findOne({ _id: storeId }).populate("userRef");
    if (!admin) {
      return res.status(404).json({ message: "Invalid storeId", success: false })
    }
    const data = { ...admin?.userRef, storeName: admin?.storeName }
    const contactForm = new ContactModel({ ...remain, storeRef: storeId });

    await contactForm.save();
    await customerContactResponse(
      data,
      contactForm.email,
      siteLogo,
      contactForm,
    );
    await adminContactResponse(
      data,
      admin?.userRef?.email,
      siteLogo,
      contactForm,
    );

    return res.status(200).json({ message: "Contact Form Submitted", success: true });
  } catch (e) {
    console.log("Error adding contact", e.message || e);
    return res.status(500).json({ message: "Something went wrong!", success: true });
  }
};

const getContactedUsers = async (req, res) => {
  try {
    const { storeId } = req.params
    const contactForms = await ContactModel.find({ storeRef: storeId });
    return res
      .status(200)
      .json({ message: "successfully Fetched", data: contactForms, success: true });
  } catch (e) {
    console.log("Error getting contacts", e.message || e);
    return res
      .status(500)
      .json({ message: "error occuring while fetching Forms", success: false });
  }
};

module.exports = { postConatctForm, getContactedUsers };
