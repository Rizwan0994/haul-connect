'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Update the ENUM to include new status values
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_employee_attendances_status" ADD VALUE IF NOT EXISTS 'late_present';
      ALTER TYPE "enum_employee_attendances_status" ADD VALUE IF NOT EXISTS 'not_marked';
      ALTER TYPE "enum_employee_attendances_status" ADD VALUE IF NOT EXISTS 'late_without_notice';
      ALTER TYPE "enum_employee_attendances_status" ADD VALUE IF NOT EXISTS 'leave_without_notice';
    `);
    
    // Update the default value
    await queryInterface.changeColumn('employee_attendances', 'status', {
      type: Sequelize.ENUM('present', 'absent', 'late', 'half_day', 'late_present', 'not_marked', 'late_without_notice', 'leave_without_notice'),
      allowNull: false,
      defaultValue: 'not_marked'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Revert to original status values
    await queryInterface.changeColumn('employee_attendances', 'status', {
      type: Sequelize.ENUM('present', 'absent', 'late', 'half_day'),
      allowNull: false,
      defaultValue: 'absent'
    });
  }
};
