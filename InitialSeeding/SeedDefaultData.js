const { ProductModel } = require("../Models/ProductModel");
const { ContentModel } = require("../Models/ContentModel");
const { SectionModel } = require("../Models/SectionsModel");
const { CollectionModel } = require("../Models/CollectionModel");

const defaultContents = [
  {
    title: "Site Logo",
    type: "Site Logo",
    image:
      "https://res.cloudinary.com/duaxitxph/image/upload/v1742809504/u2vrwclfq3pe1tzxwl7k.png",
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
        "https://tenant-web.s3.eu-north-1.amazonaws.com/uploads/1742559716118_6ss81ef2q62_34680372_8155774.jpg",
        "https://tenant-web.s3.eu-north-1.amazonaws.com/uploads/1742559716125_e9cd4hwd4nb_34680382_8155356.jpg",
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
      title: "Our Quality",
      image:
        "https://tenant-web.s3.eu-north-1.amazonaws.com/uploads/1742557598815_irbwjjex6ab_132321044_2303.i039.019.F.m004.c9.sustainable_clothes_slow_fashion_isometric-removebg.png",
      text: "<p>At [Your Company Name], we are dedicated to delivering high-quality products and services. We adhere to strict quality control standards throughout the production and development processes to ensure that our customers receive only the best. Our team is committed to continuous improvement and regularly reviews feedback to enhance our offerings. If you ever experience any issues with the quality of our products or services, please reach out to us, and we will resolve the matter promptly. Your satisfaction is our top priority.</p>",
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
        "https://tenant-web.s3.eu-north-1.amazonaws.com/uploads/1742560368509_9su05qv3wt_36242432_8410253.jpg",
      text: `<p>Our manufacturing process is designed to ensure that every product meets the highest standards of quality and durability. We use state-of-the-art technology and adhere to strict safety and quality control measures at every step. From sourcing raw materials to the final production, each phase is carefully monitored by our skilled team. Our commitment to precision and efficiency ensures that we deliver products that our customers can trust and rely on.</p>`,
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
    name: "Classic Cotton T-Shirt",
    vendor: "UrbanWear",
    price: 25,
    comparedAtPrice: 35,
    displayImage: "/images/products/tshirt-main.jpg",
    gallery: ["/images/products/tshirt-1.jpg", "/images/products/tshirt-2.jpg"],
    collections: ["60f7f3a5b6a0e024b0d0abcd"],
    stock: 100,
    status: "active",
    description: "Soft and breathable cotton T-shirt, perfect for daily wear.",
    metaTitle: "Cotton T-Shirt",
    metaDescription: "Premium quality cotton t-shirt for everyday comfort.",
    note: "Wash dark colors separately to avoid color bleeding.",
    variations: [
      {
        name: "Condition",
        options: ["Brand New", "Used", "Refurbished"],
      },
      {
        name: "Color",
        options: [
          "coral red",
          "sunny yellow",
          "mint green",
          "sky blue",
          "purple haze",
          "soft pink",
          "light salmon",
          "teal green",
        ],
      },
    ],
    variants: [
      {
        sku: "TSHIRT-RED-M",
        options: {
          Color: "Red",
          Size: "M",
        },
        stock: 10,
        price: 25,
        image: "/images/products/tshirt-red-m.jpg",
      },
    ],
    storeRef: "60f7f3a5b6a0e024b0d0aaaa",
    ratings: {
      average: 4,
      count: 32,
    },
    wantsCustomerReview: true,
  },
  {
    name: "Simple Modern Minimalist Nordic Dining Chair for Home or Kitchen",
    vendor: "ClassicGoods",
    price: 45,
    comparedAtPrice: 60,
    displayImage: "/images/products/wallet-main.jpg",
    gallery: ["/images/products/wallet-1.jpg"],
    collections: ["60f7f3a5b6a0e024b0d0abcf"],
    stock: 50,
    status: "active",
    description: "Premium handmade leather wallet with multiple compartments.",
    metaTitle: "Leather Wallet",
    metaDescription: "Durable leather wallet with elegant design.",
    variations: [],
    variants: [],
    storeRef: "60f7f3a5b6a0e024b0d0aaaa",
    note: "Due to high demand, slight delays in delivery may occur. We appreciate your patience.",
    wantsCustomerReview: true,
  },
  {
    name: "Running Sneakers",
    vendor: "SprintX",
    price: 85,
    comparedAtPrice: 100,
    displayImage: "/images/products/sneakers-main.jpg",
    gallery: [
      "/images/products/sneakers-side.jpg",
      "/images/products/sneakers-top.jpg",
    ],
    collections: [],
    stock: 200,
    status: "active",
    description: "Comfortable running shoes with breathable mesh upper.",
    metaTitle: "SprintX Running Shoes",
    metaDescription: "High-performance running shoes for all terrains.",
    variations: [
      {
        name: "Size",
        options: ["8", "9", "10"],
      },
    ],
    variants: [
      {
        sku: "SNEAKERS-9",
        options: {
          Size: "9",
        },
        stock: 40,
        price: 85,
        image: "/images/products/sneakers-9.jpg",
      },
    ],
    storeRef: "60f7f3a5b6a0e024b0d0aaaa",
    wantsCustomerReview: false,
  },
  {
    name: "Motivational Ceramic Mug",
    vendor: "MugLife",
    price: 15,
    comparedAtPrice: 20,
    displayImage: "/images/products/mug-main.jpg",
    gallery: [],
    collections: ["60f7f3a5b6a0e024b0d0abcd"],
    stock: 120,
    status: "active",
    description: "Stylish ceramic mug with inspiring quote print.",
    metaTitle: "Motivational Mug",
    metaDescription: "Start your day right with this motivational mug.",
    variations: [
      {
        name: "Color",
        options: ["White", "Black"],
      },
    ],
    variants: [
      {
        sku: "MUG-WHITE",
        options: {
          Color: "White",
        },
        stock: 60,
        price: 15,
        image: "/images/products/mug-white.jpg",
      },
    ],
    storeRef: "60f7f3a5b6a0e024b0d0aaaa",
    wantsCustomerReview: true,
  },
];

const defaultCollections = [
  {
    name: "Tshirts",
    image:
      "https://res.cloudinary.com/duaxitxph/image/upload/v1742551330/sc88u7bpbwiqeuwb40dv.png",
    slug: "tshirts",
  },
];

const SeedDefaultData = async (storeId) => {
  try {
    if (!storeId) throw new Error("storeId is required");

    for (const content of defaultContents) {
      let existingContent = await ContentModel.findOne({
        type: content.type,
        storeRef: storeId,
      });

      if (!existingContent) {
        const newContent = new ContentModel({ ...content, storeRef: storeId });
        await newContent.save();
      }
    }

    for (const section of defaultSections) {
      let existingSection = await SectionModel.findOne({
        order: section?.order,
        storeRef: storeId,
      });

      if (!existingSection) {
        const newSection = new SectionModel({ ...section, storeRef: storeId });
        await newSection.save();
      }
    }

    for (const collection of defaultCollections) {
      let existingCollection = await CollectionModel.findOne({
        name: collection.name,
      });

      if (!existingCollection) {
        const newCollection = new CollectionModel({
          ...collection,
          storeRef: storeId,
        });
        await newCollection.save();
      }
    }

    for (const product of defaultProducts) {
      const newProduct = new ProductModel({ ...product, storeRef: storeId });
      await newProduct.save();
    }
  } catch (error) {
    console.error("Error seeding default data:", error);
    throw new Error("Error seeding default data:");
  }
};

module.exports = SeedDefaultData;
