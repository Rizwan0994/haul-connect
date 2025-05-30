"use strict";
const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class User extends Model {
    static associate(models) {
      // Associations are now managed in associates/config.js
    }
  }

  User.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      role: {
        type: DataTypes.ENUM("Admin", "Super Admin", "Dispatch", "Sales", "Account", "Manager"),
        defaultValue: "Dispatch",
      },
      category: {
        type: DataTypes.ENUM(
          "Admin", 
          "Super Admin", 
          "Dispatch", 
          "Sales", 
          "Account", 
          "Manager"
        ),
        allowNull: false,
      },
      basic_salary: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 500.0,
      },
      first_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      last_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      sequelize,
      modelName: "user",
      timestamps: true,
      underscored: true,
    },
  );

  return User;
};
