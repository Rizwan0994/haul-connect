'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add new followup fields
    await queryInterface.addColumn('followup_sheets', 'followup_status', {
      type: Sequelize.ENUM('required', 'rescheduled', 'complete'),
      allowNull: false,
      defaultValue: 'required',
    });

    await queryInterface.addColumn('followup_sheets', 'followup_scheduled_date', {
      type: Sequelize.DATEONLY,
      allowNull: true,
    });

    await queryInterface.addColumn('followup_sheets', 'followup_scheduled_time', {
      type: Sequelize.TIME,
      allowNull: true,
    });

    // Change the date column from DATEONLY to DATETIME to include time
    await queryInterface.changeColumn('followup_sheets', 'date', {
      type: Sequelize.DATE,
      allowNull: false,
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove the new fields
    await queryInterface.removeColumn('followup_sheets', 'followup_status');
    await queryInterface.removeColumn('followup_sheets', 'followup_scheduled_date');
    await queryInterface.removeColumn('followup_sheets', 'followup_scheduled_time');

    // Revert date column back to DATEONLY
    await queryInterface.changeColumn('followup_sheets', 'date', {
      type: Sequelize.DATEONLY,
      allowNull: false,
    });
  }
};
