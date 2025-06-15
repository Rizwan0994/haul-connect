"use strict";
const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {  class EmployeeAttendance extends Model {
    static associate(models) {
      // Associations are defined in associates/config.js
    }
  }

  EmployeeAttendance.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      employee_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      check_in_time: {
        type: DataTypes.TIME,
        allowNull: true,
      },
      check_out_time: {
        type: DataTypes.TIME,
        allowNull: true,
      },      status: {
        type: DataTypes.ENUM('present', 'absent', 'late', 'half_day', 'late_present', 'not_marked', 'late_without_notice', 'leave_without_notice'),
        allowNull: false,
        defaultValue: 'not_marked'
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      marked_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "employee_attendance",
    //   tableName: "employee_attendances",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [
        {
          unique: true,
          fields: ['employee_id', 'date']
        },
        {
          fields: ['date']
        },
        {
          fields: ['status']
        }
      ]
    }
  );

  return EmployeeAttendance;
};
