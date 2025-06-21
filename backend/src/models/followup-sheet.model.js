"use strict";
const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class FollowupSheet extends Model {
    static associate(models) {
      // Associations can be managed in associates/config.js if needed
    }
  }

  FollowupSheet.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      agent_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },      date: {
        type: DataTypes.DATE, // Changed from DATEONLY to include time
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      mc_no: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      contact: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          isEmail: true,
        },
      },
      truck_type: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      preferred_lanes: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      equipment: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      zip_code: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      percentage: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0.0,
      },      comments: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      followup_status: {
        type: DataTypes.ENUM('required', 'rescheduled', 'complete'),
        allowNull: false,
        defaultValue: 'required',
      },
      followup_scheduled_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      followup_scheduled_time: {
        type: DataTypes.TIME,
        allowNull: true,
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
      modelName: "followup_sheet",
      tableName: "followup_sheets",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return FollowupSheet;
};
