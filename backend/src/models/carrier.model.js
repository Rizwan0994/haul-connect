
'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class CarrierProfile extends Model {
    static associate(models) {
      CarrierProfile.belongsTo(models.User, {
        foreignKey: 'agent_name',
        as: 'agent'
      });
    }
  }

  CarrierProfile.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    agent_name: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'users',
        key: 'username'
      }
    },
    mc_number: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    company_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    owner_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    phone_number: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email_address: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true
      }
    },
    address: DataTypes.STRING,
    ein_number: DataTypes.STRING,
    truck_type: DataTypes.STRING,
    equipment_type: DataTypes.STRING,
    insurance_status: {
      type: DataTypes.ENUM('valid', 'expired', 'pending'),
      defaultValue: 'pending'
    },
    insurance_expiry: DataTypes.DATE,
    factoring_company: DataTypes.STRING,
    preferred_lanes: DataTypes.TEXT,
    commission_rate: {
      type: DataTypes.DECIMAL(5, 2),
      validate: {
        min: 0,
        max: 100
      }
    },
    status: {
      type: DataTypes.ENUM('active', 'pending', 'suspended'),
      defaultValue: 'pending'
    }
  }, {
    sequelize,
    modelName: 'carrier_profile',
    timestamps: true,
    underscored: true
  });

  return CarrierProfile;
};
