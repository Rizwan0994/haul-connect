'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('employee_attendance', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      employee_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      check_in_time: {
        type: Sequelize.TIME,
        allowNull: true,
      },
      check_out_time: {
        type: Sequelize.TIME,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM('present', 'absent', 'late', 'half_day'),
        allowNull: false,
        defaultValue: 'absent'
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      marked_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      }
    });

    // Create unique index for employee_id and date combination
    await queryInterface.addIndex('employee_attendance', {
      fields: ['employee_id', 'date'],
      unique: true,
      name: 'employee_attendance_employee_date_unique'
    });

    // Create index for date
    await queryInterface.addIndex('employee_attendance', {
      fields: ['date'],
      name: 'employee_attendance_date_index'
    });

    // Create index for status
    await queryInterface.addIndex('employee_attendance', {
      fields: ['status'],
      name: 'employee_attendance_status_index'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('employee_attendance');
  }
};
