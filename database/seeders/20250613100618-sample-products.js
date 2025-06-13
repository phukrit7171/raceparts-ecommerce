'use strict';
const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('products', [
      { uuid: uuidv4(), name: 'Ohlins Road & Track Coilovers', slug: 'ohlins-road-track', description: 'Top-tier adjustable suspension for street and circuit.', price: 2899.99, stock_quantity: 10, category_id: 1, created_at: new Date(), updated_at: new Date() },
      { uuid: uuidv4(), name: 'StopTech Big Brake Kit', slug: 'stoptech-bbk', description: '6-piston front calipers with slotted rotors.', price: 2500.00, stock_quantity: 5, category_id: 2, created_at: new Date(), updated_at: new Date() },
      { uuid: uuidv4(), name: 'AWE Tuning Cat-Back Exhaust', slug: 'awe-exhaust', description: 'Stainless steel exhaust system with a refined tone.', price: 1500.00, stock_quantity: 15, category_id: 3, created_at: new Date(), updated_at: new Date() },
      { uuid: uuidv4(), name: 'Volk TE37 Saga Wheels', slug: 'volk-te37', description: 'Legendary forged lightweight wheels.', price: 3600.00, stock_quantity: 4, category_id: 4, created_at: new Date(), updated_at: new Date() },
      { uuid: uuidv4(), name: 'Eibach Pro-Kit Springs', slug: 'eibach-springs', description: 'Lowering springs for improved handling and appearance.', price: 350.00, stock_quantity: 25, category_id: 1, created_at: new Date(), updated_at: new Date() }
    ], {});
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('products', null, {});
  }
};
