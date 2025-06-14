"use strict";
require("dotenv").config({ path: require("path").join(__dirname, "../../.env") });
const { v4: uuidv4 } = require("uuid");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const products = [
      {
        uuid: uuidv4(),
        name: "Ohlins Road & Track Coilovers",
        slug: "ohlins-road-track",
        description: "Top-tier adjustable suspension for street and circuit.",
        price: 2899.99,
        stock_quantity: 10,
        category_id: 1,
      },
      {
        uuid: uuidv4(),
        name: "StopTech Big Brake Kit",
        slug: "stoptech-bbk",
        description: "6-piston front calipers with slotted rotors.",
        price: 2500.0,
        stock_quantity: 5,
        category_id: 2,
      },
      {
        uuid: uuidv4(),
        name: "AWE Tuning Cat-Back Exhaust",
        slug: "awe-exhaust",
        description: "Stainless steel exhaust system with a refined tone.",
        price: 1500.0,
        stock_quantity: 15,
        category_id: 3,
      },
      {
        uuid: uuidv4(),
        name: "Volk TE37 Saga Wheels",
        slug: "volk-te37",
        description: "Legendary forged lightweight wheels.",
        price: 3600.0,
        stock_quantity: 4,
        category_id: 4,
      },
      {
        uuid: uuidv4(),
        name: "Eibach Pro-Kit Springs",
        slug: "eibach-springs",
        description: "Lowering springs for improved handling and appearance.",
        price: 350.0,
        stock_quantity: 25,
        category_id: 1,
      },
    ];

    // Check which slugs already exist
    const existingProducts = await queryInterface.sequelize.query(
      `SELECT slug FROM products WHERE slug IN (${products
        .map((p) => `'${p.slug}'`)
        .join(",")})`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    const existingSlugs = existingProducts.map((p) => p.slug);

    // Filter out products that already exist
    const productsToInsert = products.filter(
      (p) => !existingSlugs.includes(p.slug)
    );

    if (productsToInsert.length > 0) {
      // We must regenerate UUIDs for only the products we are inserting
      const finalProductsToInsert = productsToInsert.map((p) => ({
        ...p,
        uuid: uuidv4(),
      }));
      await queryInterface.bulkInsert("products", finalProductsToInsert, {});
      console.log(
        `[Seeder] Inserted ${finalProductsToInsert.length} new products.`
      );
    } else {
      console.log("[Seeder] All sample products already exist. Skipping.");
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("products", null, {});
  },
};
