'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('categories', [
      { name: 'Suspension', slug: 'suspension', description: 'Coilovers, springs, and sway bars.', created_at: new Date(), updated_at: new Date() },
      { name: 'Brakes', slug: 'brakes', description: 'Pads, rotors, and big brake kits.', created_at: new Date(), updated_at: new Date() },
      { name: 'Engine', slug: 'engine', description: 'Intakes, exhausts, and tuning.', created_at: new Date(), updated_at: new Date() },
      { name: 'Wheels & Tires', slug: 'wheels-tires', description: 'Lightweight wheels and performance tires.', created_at: new Date(), updated_at: new Date() }
    ], {});
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('categories', null, {});
  }
};
