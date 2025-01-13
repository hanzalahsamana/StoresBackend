const mongoose = require("mongoose");
const { pageSchema } = require("../Models/PagesModel");

const defaultPages = [
  {
    title: "Site Logo",
    type: "Site Logo",
  },
  {
    title: "About Us",
    type: "About Us",
  },
  {
    title: "Our Quality",
    type: "Our Quality",
  },
  {
    title: "Manufacture Process",
    type: "Manufacture Process",
  },
  {
    title: "FAQ",
    type: "FAQ",
    faqs: [{ Q: "What is your company?", A: "We are a tech company." }],
  },
  {
    title: "Contact",
    type: "Contact",
    email: "support@example.com",
    phone: "+1 800 123 456",
  },
  {
    title: "Privacy Policy",
    type: "Privacy Policy",
  },
  {
    title: "Return Policy",
    type: "Return Policy",
  },
  {
    title: "Fabric Remants",
    type: "Fabric Remants",
  },
  {
    title: "Shipping Policy",
    type: "Shipping Policy",
  },
  {
    title: "Terms and Conditions",
    type: "Terms and Conditions",
  },
];

const SeedDefaultPages = async (type) => {
  try {
    for (const page of defaultPages) {
      const PageModel = mongoose.model(
        type + "_pages",
        pageSchema,
        type + "_pages"
      );
      let existingPage = await PageModel.findOne({ type: page.type });

      if (!existingPage) {
        const newPage = new PageModel(page);
        await newPage.save();
      }
    }
  } catch (error) {
    console.error("Error seeding default pages:", error);
  }
};

module.exports = SeedDefaultPages;
