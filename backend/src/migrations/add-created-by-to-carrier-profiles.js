'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add created_by column to carrier_profiles table
    await queryInterface.addColumn('carrier_profiles', 'created_by', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
      comment: 'User who created this carrier profile'
    });

    // Add index for better query performance
    await queryInterface.addIndex('carrier_profiles', ['created_by'], {
      name: 'idx_carrier_profiles_created_by'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove index first
    await queryInterface.removeIndex('carrier_profiles', 'idx_carrier_profiles_created_by');
    
    // Remove created_by column
    await queryInterface.removeColumn('carrier_profiles', 'created_by');
  }
};
