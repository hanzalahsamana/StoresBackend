const { ProductModel } = require('../Models/ProductModel');
const { CollectionModel } = require('../Models/CollectionModel');
const { PageModel } = require('../Models/PageModel');
const { v4: uuidv4 } = require('uuid');
const { generateSlug } = require('../Utils/generateSlug');
const { ThemeLayoutModel } = require('../Models/ThemeLayoutModel');
const { ConfigurationModel } = require('../Models/ConfigurationModel');

async function getDefaultProducts(storeId, collections) {
  const [tshirtCollection] = collections.filter((c) => c.name === 'Tshirts');

  return [
    {
      name: 'Classic Cotton T-Shirt',
      vendor: 'UrbanWear',
      price: 25,
      comparedAtPrice: 35,
      displayImage: 'https://res.cloudinary.com/duaxitxph/image/upload/v1736247980/cjzl4ivq2lduxqbtnfj1.webp',
      gallery: [],
      collections: [tshirtCollection?._id],
      stock: 100,
      status: 'active',
      description: 'Soft and breathable cotton T-shirt, perfect for daily wear.',
      metaTitle: 'Cotton T-Shirt',
      metaDescription: 'Premium quality cotton t-shirt for everyday comfort.',
      note: 'Wash dark colors separately to avoid color bleeding.',
      variations: [
        {
          id: uuidv4(),
          name: 'Condition',
          options: ['Brand New', 'Used', 'Refurbished'],
        },
        {
          id: uuidv4(),
          name: 'Color',
          options: ['coral red', 'sunny yellow', 'mint green', 'sky blue', 'purple haze', 'soft pink', 'light salmon', 'teal green'],
        },
      ],
      variants: [
        {
          sku: 'TSHIRT-RED-M',
          options: { Color: 'Red', Size: 'M' },
          stock: 10,
          price: 25,
          image: '/images/products/tshirt-red-m.jpg',
        },
      ],
      storeRef: storeId,
      ratings: { average: 4, count: 32 },
      wantsCustomerReview: true,
      slug: await generateSlug('Classic Cotton T-Shirt', ProductModel),
    },
    {
      name: 'Simple Modern Minimalist Nordic Dining Chair for Home or Kitchen',
      vendor: 'ClassicGoods',
      price: 45,
      comparedAtPrice: 60,
      displayImage: 'https://res.cloudinary.com/duaxitxph/image/upload/v1736247980/cjzl4ivq2lduxqbtnfj1.webp',
      gallery: [],
      collections: [],
      stock: 50,
      status: 'active',
      description: 'Premium handmade leather wallet with multiple compartments.',
      metaTitle: 'Leather Wallet',
      metaDescription: 'Durable leather wallet with elegant design.',
      variations: [],
      variants: [],
      storeRef: storeId,
      note: 'Due to high demand, slight delays in delivery may occur. We appreciate your patience.',
      wantsCustomerReview: true,
      slug: await generateSlug('Simple Modern Minimalist Nordic Dining Chair for Home or Kitchen', ProductModel),
    },
    {
      name: 'Running Sneakers',
      vendor: 'SprintX',
      price: 85,
      comparedAtPrice: 100,
      displayImage: 'https://res.cloudinary.com/duaxitxph/image/upload/v1736247980/cjzl4ivq2lduxqbtnfj1.webp',
      gallery: [],
      collections: [],
      stock: 200,
      status: 'active',
      description: 'Comfortable running shoes with breathable mesh upper.',
      metaTitle: 'SprintX Running Shoes',
      metaDescription: 'High-performance running shoes for all terrains.',
      variations: [
        {
          id: uuidv4(),
          name: 'Size',
          options: ['8', '9', '10'],
        },
      ],
      variants: [
        {
          sku: 'SNEAKERS-9',
          options: { Size: '9' },
          stock: 40,
          price: 85,
          image: '/images/products/sneakers-9.jpg',
        },
      ],
      storeRef: storeId,
      wantsCustomerReview: false,
      slug: await generateSlug('Running Sneakers', ProductModel),
    },
    {
      name: 'Motivational Ceramic Mug',
      vendor: 'MugLife',
      price: 15,
      comparedAtPrice: 20,
      displayImage: 'https://res.cloudinary.com/duaxitxph/image/upload/v1736247980/cjzl4ivq2lduxqbtnfj1.webp',
      gallery: [],
      collections: [tshirtCollection?._id],
      stock: 120,
      status: 'active',
      description: 'Stylish ceramic mug with inspiring quote print.',
      metaTitle: 'Motivational Mug',
      metaDescription: 'Start your day right with this motivational mug.',
      variations: [
        {
          id: uuidv4(),
          name: 'Color',
          options: ['White', 'Black'],
        },
      ],
      variants: [
        {
          sku: 'MUG-WHITE',
          options: { Color: 'White' },
          stock: 60,
          price: 15,
          image: '/images/products/mug-white.jpg',
        },
      ],
      storeRef: storeId,
      wantsCustomerReview: true,
      slug: await generateSlug('Motivational Ceramic Mug', ProductModel),
    },
  ];
}

const defaultCollections = [
  {
    name: 'Tshirts',
    image: 'https://res.cloudinary.com/duaxitxph/image/upload/v1742551330/sc88u7bpbwiqeuwb40dv.png',
    slug: 'tshirts',
  },
];

const SeedDefaultData = async (storeId) => {
  try {
    if (!storeId) throw new Error('storeId is required');
    const headerLayout = {
      storeRef: storeId,
      mode: 'published',
      name: 'header',
      data: {
        globalLogo: false,
        headerLogo: 'https://res.cloudinary.com/duaxitxph/image/upload/v1736247980/cjzl4ivq2lduxqbtnfj1.webp',
        navLinks: [
          { name: 'Home', slug: '/' },
          { name: 'Catalog', slug: '/products' },
          { name: 'About Us', slug: '/pages/about-us' },
        ],
        style: 'sticky',
      },
    };

    const footerLayout = {
      storeRef: storeId,
      mode: 'published',
      name: 'footer',
      data: {
        globalLogo: false,
        footerLogo: 'https://res.cloudinary.com/duaxitxph/image/upload/v1736247980/cjzl4ivq2lduxqbtnfj1.webp',
        email: 'example@gmail.com',
        phone: '123456789',
        location: '123 Example Street, A/1, Karachi, Pakistan',
        copyright: '© 2025 YourCompany. All rights reserved.',
        socialLinks: {
          facebook: 'https://facebook.com',
          twitter: 'https://twitter.com',
          instagram: 'https://instagram.com',
        },
        navLinks: [
          { name: 'Home', slug: '/' },
          { name: 'Catalog', slug: '/products' },
          { name: 'About Us', slug: '/pages/about-us' },
        ],
        style: 'style1',
      },
    };
    await ThemeLayoutModel.insertMany([headerLayout, footerLayout]);
    // --- Step 1: Create default collections ---
    const createdCollections = [];
    for (const collection of defaultCollections) {
      const newCollection = new CollectionModel({ ...collection, storeRef: storeId });
      await newCollection.save();
      createdCollections.push(newCollection);
    }

    // --- Step 2: Create default products ---
    const defaultProducts = await getDefaultProducts(storeId, createdCollections);
    for (const product of defaultProducts) {
      const newProduct = new ProductModel(product);
      await newProduct.save();
    }

    // --- Step 3: Create default pages ---
    const homepageSections = [
      {
        _id: uuidv4(),
        name: 'Hero Banner',
        type: 'hero_banner',
        order: 1,
        sectionData: {
          title: 'Welcome to Your Store',
          subtitle: 'Start selling amazing products today!',
          buttonText: 'Shop Now',
          buttonLink: '/products',
          image: 'https://res.cloudinary.com/duaxitxph/image/upload/v1736247980/cjzl4ivq2lduxqbtnfj1.webp',
        },
      },
      {
        _id: uuidv4(),
        name: 'Featured Collections',
        type: 'feature_collection',
        order: 2,
        sectionData: {
          title: 'Our Featured Collections',
          collectionIds: createdCollections.map((c) => c._id),
        },
      },
      {
        _id: uuidv4(),
        name: 'Featured Products',
        type: 'feature_product',
        order: 3,
        sectionData: {
          title: 'Best Selling Products',
          productsToShow: 'all',
        },
      },
      {
        _id: uuidv4(),
        name: 'Promo Section',
        type: 'promo_section',
        order: 4,
        sectionData: {
          heading: 'Exclusive Offer!',
          buttonText: 'Shop Now',
          content:
            "Get the best deals on our latest products. Limited-time offer! Enjoy huge discounts, free shipping, and special perks when you shop today. Don't miss out on this opportunity to save big!",
          image: 'https://res.cloudinary.com/duaxitxph/image/upload/v1736859498/v6pws4qg9rfegcqx85en.jpg',
          style: 'style1',
        },
      },
      {
        _id: uuidv4(),
        name: 'Rich Text',
        type: 'rich_text',
        order: 5,
        sectionData: {
          heading: 'Why Shop With Us?',
          content: 'We offer the best quality products with unbeatable prices and exceptional support.',
        },
      },
    ];

    const catalogSections = [
      {
        _id: uuidv4(),
        name: 'Catalog',
        type: 'catalog',
        order: 1,
        sectionData: {},
      },
    ];

    const aboutUsSections = [
      {
        _id: uuidv4(),
        name: 'About Us',
        type: 'rich_text',
        order: 1,
        sectionData: {
          heading: 'About Our Store',
          content: 'Welcome to our store! We are dedicated to bringing you the best shopping experience possible.',
        },
      },
    ];

    const pagesData = [
      {
        name: 'Homepage',
        slug: '/',
        type: 'system',
        mode: 'published',
        isHeaderFooter: true,
        storeRef: storeId,
        sections: homepageSections,
      },
      {
        name: 'Catalog',
        slug: '/products',
        type: 'system',
        mode: 'published',
        isHeaderFooter: true,
        storeRef: storeId,
        sections: catalogSections,
      },
      {
        name: 'About Us',
        slug: '/pages/about-us',
        type: 'custom',
        mode: 'published',
        isHeaderFooter: true,
        storeRef: storeId,
        sections: aboutUsSections,
      },
    ];

    for (const page of pagesData) {
      const newPage = new PageModel(page);
      await newPage.save();
    }

    await ConfigurationModel.create({
      storeRef: storeId,
    });

    console.log('✅ Default data seeded successfully for store:', pagesData);
  } catch (error) {
    console.error('❌ Error seeding default data:', error);
    throw new Error('Error seeding default data');
  }
};

module.exports = SeedDefaultData;
