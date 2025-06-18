'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('carrier_profiles', 'commission_paid', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false,
      comment: 'Whether commission has been paid to the sales agent'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('carrier_profiles', 'commission_paid');
  }
};
