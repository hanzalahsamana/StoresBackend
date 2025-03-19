const mongoose = require("mongoose");
const { pageSchema } = require("../Models/PagesModel");
const { categorySchema } = require("../Models/CategoryModal");
const { productSchema } = require("../Models/ProductModal");
const { SectionSchema } = require("../Models/SectionsModal");

const defaultPages = [
  {
    title: "Site Logo",
    type: "Site Logo",
    image:
      "https://res.cloudinary.com/duaxitxph/image/upload/v1736856557/fduuuz6bcqbwvcdfkhhy.png",
  },
  {
    title: "About Us",
    type: "About Us",
    text: "At [Your Company Name], we are passionate about delivering innovative solutions that meet the needs of our customers. Our company was founded with the goal of providing high-quality products and services that improve lives and create lasting value. With a dedicated team of professionals and a commitment to excellence, we aim to be a leader in [your industry]. We pride ourselves on our customer-centric approach and strive to exceed expectations in everything we do.",
  },
  {
    title: "FAQ",
    type: "FAQ",
    faqs: [
      {
        Q: "What services do you offer?",
        A: "We offer web development, mobile app development, and design services. Our goal is to deliver quality and user-friendly products.",
      },
      {
        Q: "What is your company?",
        A: "We are a tech company. We specialize in innovative software solutions.",
      },
      {
        Q: "How can I contact support?",
        A: "You can contact our support team via email or through our contact form. We respond within 24 hours to all queries.",
      },
      {
        Q: "Do you offer custom solutions?",
        A: "Yes, we offer tailored solutions based on your business needs. Our team works closely with clients to ensure satisfaction.",
      },
    ],
  },
  {
    title: "Privacy Policy",
    type: "Privacy Policy",
    text: "At [Your Company Name], we are committed to protecting your privacy. This Privacy Policy outlines how we collect, use, and safeguard your personal information when you visit our website or use our services. We may collect information such as your name, email address, and browsing behavior to enhance your user experience. We do not share your personal information with third parties without your consent, except as required by law. By using our services, you agree to the terms outlined in this policy. For any questions or concerns, please contact us at [Your Contact Information].",
  },
  {
    title: "Return Policy",
    type: "Return Policy",
    text: "At [Your Company Name], we strive for customer satisfaction. If you are not completely satisfied with your purchase, you may return it within [X] days of receiving the item. The product must be unused, in its original packaging, and in the same condition as when it was delivered. Please contact our customer service team at [Your Contact Information] to initiate the return process. Shipping costs for returns are the responsibility of the customer, unless the return is due to a defect or error on our part. Once the return is processed, a refund will be issued to the original payment method.",
  },
  {
    title: "Shipping Policy",
    type: "Shipping Policy",
    text: "We offer fast and reliable shipping options to ensure that your orders arrive on time. Orders are typically processed within [X] business days, and delivery times vary based on your location. Shipping costs are calculated at checkout, and we offer various shipping methods to suit your needs. If you experience any issues with your order or have questions about shipping, our customer support team is here to assist you.",
  },
  {
    title: "Terms and Conditions",
    type: "Terms and Conditions",
    text: "By using [Your Company Name]'s services or purchasing our products, you agree to abide by the terms and conditions outlined here. Our terms include information on payment policies, returns and exchanges, shipping and delivery, and limitations of liability. We reserve the right to update these terms at any time, and we recommend reviewing them regularly. If you have any questions or concerns, please contact us at [Your Contact Information].",
  },
  {
    title: "Contact Us",
    type: "Contact",
    email: "support@example.com",
    phone: "+1 234 234 234",
    address: "1234 Elm Street, Springfield, IL 62701,United States",
  },
];

const defaultSections = [
  {
    type: "banner_slider",
    sectionName: "Banner Slider",
    order: 1,
    visibility: true,
    content: {
      title: "Banner Slider",
      imagesUrl: [
        "https://res.cloudinary.com/duaxitxph/image/upload/v1737576876/qcte92lscbynyvsldpvm.png",
        "https://res.cloudinary.com/duaxitxph/image/upload/v1737576876/qcte92lscbynyvsldpvm.png",
      ],
    },
  },
  {
    type: "feature_collection",
    sectionName: "Featured Collection",
    order: 2,
    visibility: true,
    content: {
      title: "Featured Collections",
      collections: [],
    },
  },
  {
    type: "promo_section",
    sectionName: "Promo Section",
    order: 3,
    visibility: true,
    content: {
      title: "Our Quality Promise:",
      image:
        "https://res.cloudinary.com/duaxitxph/image/upload/v1737653347/nwfziv7e8iaouflrxvtw.png",
      text: "<p>At <em>Modest Wardrobe</em>, quality is at the heart of everything we do. Here’s what sets us apart:</p><p>💎 <strong>Premium Fabrics:</strong> We source the finest materials to ensure each piece is soft, breathable, and durable.</p><p>💎 <strong>Stringent Quality Checks:</strong> Every item is inspected thoroughly to meet our high standards before it reaches you.</p><p>💎 <strong>Comfort Meets Elegance:</strong> We prioritize your comfort without compromising on style, ensuring every piece feels as good as it looks.</p><p>💎 <strong>Sustainable Practices:</strong> We are mindful of the environment and practice ethical manufacturing processes.</p><p>When you shop with <em>Modest Wardrobe</em>, you’re not just buying clothes—you’re investing in timeless pieces designed with love, care, and purpose.</p><p><em>Ready to experience the difference? Explore our collection and feel the quality for yourself!</em> 💕</p>",
      buttonText: "Shop Now",
      styleType: "style1",
    },
  },
  {
    type: "feature_product",
    sectionName: "Featured Product",
    order: 4,
    visibility: true,
    content: {
      title: "Best Sellers",
      maxLength: 4,
      productType: "All",
      selectedCategories: [],
      selectedProducts: [],
    },
  },
  {
    type: "promo_section",
    sectionName: "Promo Section",
    order: 5,
    visibility: true,
    content: {
      buttonText: "Shop Now",
      styleType: "style2",
      title: "Manufacture Process",
      image:
        "https://res.cloudinary.com/duaxitxph/image/upload/v1737654268/oc4p9o1qoe3hcauforq6.png",
      text: `<p><strong>Our Manufacturing Process – Crafted with Care 🤍</strong></p><p>At <em>Modest Wardrobe</em>, every piece is designed and crafted to ensure you feel confident, comfortable, and beautiful. Here’s a glimpse into our thoughtful manufacturing process:</p><p>🌟 <strong>Step 1: Inspired Designs</strong></p><p>We begin with you in mind—creating designs that balance modesty with modern elegance, tailored to your needs and preferences.</p><p>🌟 <strong>Step 2: Premium Fabric Selection</strong></p><p>We handpick high-quality, breathable, and durable fabrics to ensure every piece feels as good as it looks.</p><p>🌟 <strong>Step 3: Expert Craftsmanship</strong></p><p>Our skilled artisans bring each design to life with precision and care, ensuring flawless finishes and timeless quality.</p><p>🌟 <strong>Step 4: Ethical Practices</strong></p><p>We are committed to fair and ethical practices, ensuring our team works in a safe and empowering environment.</p><p>🌟 <strong>Step 5: Quality Checks</strong></p><p>Every item undergoes strict quality control to ensure it meets our high standards before reaching your wardrobe.</p><p>🌟 <strong>Step 6: Thoughtful Packaging</strong></p><p>Your order is lovingly packed to feel like a gift—because you deserve nothing less!</p><p>With <em>Modest Wardrobe</em>, you’re not just wearing clothes; you’re embracing a lifestyle that reflects your values and celebrates your individuality.</p><p>Follow us on Instagram for more updates and behind-the-scenes moments!</p><p><strong><a href="https://www.instagram.com/_modestwardrobe_6912/" rel="noopener noreferrer" target="_blank">Instagram: @_modestwardrobe_6912</a></strong></p>`,
    },
  },
  {
    type: "rich_text",
    sectionName: "Rich Text",
    order: 6,
    visibility: true,
    content: {
      title: "Why Choose Us?",
      text: "We provide high-quality products with fast delivery and excellent customer service.",
      buttonText: "Shop Now",
    },
  },
];

const defaultProducts = [
  {
    name: "Product 1",
    alt: "Product 1",
    brand: "ABCD",
    originalPrice: 4500,
    discountedPrice: 2925,
    discount: 35,
    images: [
      "https://res.cloudinary.com/duaxitxph/image/upload/v1736856557/oviqnxjktnoyrpv2yono.jpg",
      "https://res.cloudinary.com/duaxitxph/image/upload/v1736856557/oviqnxjktnoyrpv2yono.jpg",
    ],
    stock: 100,
    size: ["S", "M", "L", "XL"],
    collectionName: "collection-1",
    type: "Unstiched",
  },
  {
    name: "Product 2",
    alt: "Product 2",
    brand: "ABCD",
    originalPrice: 4500,
    discountedPrice: 2925,
    discount: 35,
    images: [
      "https://res.cloudinary.com/duaxitxph/image/upload/v1736856557/oviqnxjktnoyrpv2yono.jpg",
      "https://res.cloudinary.com/duaxitxph/image/upload/v1736856557/oviqnxjktnoyrpv2yono.jpg",
    ],
    collectionName: "collection-1",
    stock: 100,
    size: ["S", "M", "L", "XL"],
    type: "Unstiched",
  },
  {
    name: "Product 3",
    alt: "Product 3",
    brand: "ABCD",
    originalPrice: 5000,
    discountedPrice: 4000,
    discount: 20,
    images: [
      "https://res.cloudinary.com/duaxitxph/image/upload/v1736856557/oviqnxjktnoyrpv2yono.jpg",
      "https://res.cloudinary.com/duaxitxph/image/upload/v1736856557/oviqnxjktnoyrpv2yono.jpg",
    ],
    collectionName: "collection-2",
    stock: 100,
    size: ["S", "M", "L", "XL"],
    type: "stiched",
  },
  {
    name: "Product 4",
    alt: "Product 4",
    brand: "ABCD",
    originalPrice: 5000,
    discountedPrice: 4000,
    discount: 20,
    images: [
      "https://res.cloudinary.com/duaxitxph/image/upload/v1736856557/oviqnxjktnoyrpv2yono.jpg",
      "https://res.cloudinary.com/duaxitxph/image/upload/v1736856557/oviqnxjktnoyrpv2yono.jpg",
    ],
    collectionName: "collection-2",
    stock: 100,
    size: ["S", "M", "L", "XL"],
    type: "stiched",
  },
];

const defaultCategories = [
  {
    name: "Collection-1",
    image:
      "https://res.cloudinary.com/duaxitxph/image/upload/v1736856557/bbg5cqlwuu9puvtopi9b.jpg",
    link: "collection-1",
  },
  {
    name: "Collection-2",
    image:
      "https://res.cloudinary.com/duaxitxph/image/upload/v1736856557/bbg5cqlwuu9puvtopi9b.jpg",
    link: "collection-2",
  },
  {
    name: "Collection-3",
    image:
      "https://res.cloudinary.com/duaxitxph/image/upload/v1736856557/bbg5cqlwuu9puvtopi9b.jpg",
    link: "collection-3",
  },
];

const SeedDefaultData = async (type) => {
  try {
    // const PageModel = mongoose.model(
    //   type + "_pages",
    //   pageSchema,
    //   type + "_pages"
    // );
    // for (const page of defaultPages) {
    //   let existingPage = await PageModel.findOne({ type: page.type });

    //   if (!existingPage) {
    //     const newPage = new PageModel(page);
    //     await newPage.save();
    //   }
    // }

    const SectionModel = mongoose.model(
      type + "_sections",
      SectionSchema,
      type + "_section"
    );
    for (const section of defaultSections) {
      let existingSection = await SectionModel.findOne({
        order: section?.order,
      });

      if (!existingSection) {
        const newSection = new SectionModel(section);
        await newSection.save();
      }
    }

    // const CategoryModel = mongoose.model(
    //   type + "_category",
    //   categorySchema,
    //   type + "_category"
    // );
    // for (const category of defaultCategories) {
    //   let existingCategory = await CategoryModel.findOne({
    //     link: category.link,
    //   });

    //   if (!existingCategory) {
    //     const newCategory = new CategoryModel(category);
    //     await newCategory.save();
    //   }
    // }

    // const ProductModel = mongoose.model(
    //   type + "_products",
    //   productSchema,
    //   type + "_products"
    // );

    // for (const product of defaultProducts) {
    //   let existingProduct = await ProductModel.findOne({ name: product.name });

    //   if (!existingProduct) {
    //     const newProduct = new ProductModel(product);
    //     await newProduct.save();
    //   }
    // }
  } catch (error) {
    console.error("Error seeding default data:", error);
  }
};

module.exports = SeedDefaultData;
