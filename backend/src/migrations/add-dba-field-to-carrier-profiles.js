'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('carrier_profiles', 'dba', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'Doing Business As name'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('carrier_profiles', 'dba');
  }
};
