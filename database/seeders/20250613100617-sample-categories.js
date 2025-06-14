"use strict";
require("dotenv").config({ path: require("path").join(__dirname, "../../.env") });
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const categories = [
      {
        name: "Suspension",
        slug: "suspension",
        description: "Coilovers, springs, and sway bars.",
      },
      {
        name: "Brakes",
        slug: "brakes",
        description: "Pads, rotors, and big brake kits.",
      },
      {
        name: "Engine",
        slug: "engine",
        description: "Intakes, exhausts, and tuning.",
      },
      {
        name: "Wheels & Tires",
        slug: "wheels-tires",
        description: "Lightweight wheels and performance tires.",
      },
    ];

    // Check which slugs already exist
    const existingCategories = await queryInterface.sequelize.query(
      `SELECT slug FROM categories WHERE slug IN (${categories
        .map((c) => `'${c.slug}'`)
        .join(",")})`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    const existingSlugs = existingCategories.map((c) => c.slug);

    // Filter out categories that already exist
    const categoriesToInsert = categories.filter(
      (c) => !existingSlugs.includes(c.slug)
    );

    if (categoriesToInsert.length > 0) {
      await queryInterface.bulkInsert("categories", categoriesToInsert, {});
      console.log(
        `[Seeder] Inserted ${categoriesToInsert.length} new categories.`
      );
    } else {
      console.log("[Seeder] All sample categories already exist. Skipping.");
    }
  },

  down: async (queryInterface, Sequelize) => {
    // This can remain the same
    await queryInterface.bulkDelete("categories", null, {});
  },
};
