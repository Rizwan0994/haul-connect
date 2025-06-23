'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add highway_number column to carrier_profiles table
    await queryInterface.addColumn('carrier_profiles', 'highway_number', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'Highway number for carrier'
    });

    // Add highway_email column to carrier_profiles table
    await queryInterface.addColumn('carrier_profiles', 'highway_email', {
      type: Sequelize.STRING,
      allowNull: true,
      validate: {
        isEmail: true
      },
      comment: 'Highway email address for carrier'
    });

    console.log('Added highway_number and highway_email columns to carrier_profiles table');
  },

  async down(queryInterface, Sequelize) {
    // Remove highway_email column
    await queryInterface.removeColumn('carrier_profiles', 'highway_email');
    
    // Remove highway_number column  
    await queryInterface.removeColumn('carrier_profiles', 'highway_number');

    console.log('Removed highway_number and highway_email columns from carrier_profiles table');
  }
};
