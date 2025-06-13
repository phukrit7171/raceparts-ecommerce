"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert(
      "categories",
      [
        {
          name: "Suspension",
          slug: "suspension",
          description: "Coilovers, springs, and sway bars."

        },
        {
          name: "Brakes",
          slug: "brakes",
          description: "Pads, rotors, and big brake kits."

        },
        {
          name: "Engine",
          slug: "engine",
          description: "Intakes, exhausts, and tuning."

        },
        {
          name: "Wheels & Tires",
          slug: "wheels-tires",
          description: "Lightweight wheels and performance tires."
        },
      ],
      {}
    );
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("categories", null, {});
  },
};
