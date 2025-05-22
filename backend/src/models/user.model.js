
'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class User extends Model {
    static associate(models) {
      User.hasMany(models.CarrierProfile, { foreignKey: 'agent_name', as: 'managedCarriers' });
      User.hasMany(models.Dispatch, { foreignKey: 'user_id', as: 'dispatches' });
      User.hasMany(models.FollowupSheet, { foreignKey: 'agent_name', as: 'followups' });
      User.hasMany(models.Notification, { foreignKey: 'username', as: 'notifications' });
    }
  }

  User.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    username: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    role: {
      type: DataTypes.ENUM('admin', 'user'),
      defaultValue: 'user'
    },
    category: {
      type: DataTypes.ENUM(
        'dispatch_user', 'sales_user', 'sales_manager', 'dispatch_manager',
        'accounts_user', 'accounts_manager', 'hr_manager', 'hr_user',
        'admin_user', 'admin_manager', 'super_admin'
      ),
      allowNull: false
    },
    basic_salary: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 500.00
    }
  }, {
    sequelize,
    modelName: 'user',
    timestamps: true,
    underscored: true
  });

  return User;
};
