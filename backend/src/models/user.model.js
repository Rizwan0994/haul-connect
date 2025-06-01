"use strict";
const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class User extends Model {
    static associate(models) {
      // Add association to the Role model
      User.belongsTo(models.role, {
        foreignKey: "role_id"
      });
    }

    // Instance method to compare passwords
    async comparePassword(candidatePassword) {
      const bcrypt = require('bcrypt');
      return await bcrypt.compare(candidatePassword, this.password);
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
      role_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'roles',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
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
      // New profile fields
      fatherName: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'father_name'
      },
      address: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      contact: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      cnic: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      experience: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      department: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      photoUrl: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'photo_url'
      },
      lastLogin: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'last_login'
      },
      lastLoginIp: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'last_login_ip'
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
