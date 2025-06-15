"use strict";
const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class Shipper extends Model {
    static associate(models) {
      // Associations are defined in associates/config.js
    }
  }

  Shipper.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
    //   shipper_id: {
    //     type: DataTypes.STRING,
    //     allowNull: false,
    //     unique: true,
    //   },
      shipper_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      contact: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      telephone: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      address: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      ext: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          isEmail: true,
        },
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      attachment_path: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      attachment_filename: {
        type: DataTypes.STRING,
        allowNull: true,
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
      modelName: "shipper",
      tableName: "shippers",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      hooks: {
        beforeCreate: async (shipper) => {
          if (!shipper.shipper_id) {
            // Generate unique shipper ID
            const timestamp = Date.now();
            const random = Math.floor(Math.random() * 1000);
            shipper.shipper_id = `SHP-${timestamp}-${random}`;
          }
        },
      },
    }
  );

  return Shipper;
};
