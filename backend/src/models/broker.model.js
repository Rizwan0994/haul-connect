"use strict";
const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class Broker extends Model {
    static associate(models) {
      // Associations are defined in associates/config.js
    }
  }

  Broker.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      brokerage_company: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      agent_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      agent_phone: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      agent_email: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          isEmail: true,
        },
      },
      created_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      updated_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
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
      modelName: "broker",
      tableName: "brokers",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return Broker;
};
