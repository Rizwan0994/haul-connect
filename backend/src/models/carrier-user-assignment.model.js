"use strict";
const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class CarrierUserAssignment extends Model {
    static associate(models) {
      // Associations are now managed in associates/config.js
    }
  }

  CarrierUserAssignment.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      carrier_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'carrier_profiles',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      assigned_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      assigned_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      }
    },
    {
      sequelize,
      modelName: "carrier_user_assignment",
      tableName: "carrier_user_assignments",
      timestamps: true,
      underscored: true,
      indexes: [
        {
          unique: true,
          fields: ['carrier_id', 'user_id']
        }
      ]
    }
  );

  return CarrierUserAssignment;
};
