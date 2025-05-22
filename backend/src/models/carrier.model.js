'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class CarrierProfile extends Model {
    static associate(models) {
      // Define associations
      CarrierProfile.belongsTo(models.user, { 
        foreignKey: 'agent_name',
        targetKey: 'username',
        as: 'agent' 
      });
      CarrierProfile.hasMany(models.dispatch, { 
        foreignKey: 'carrier_id',
        as: 'dispatches' 
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
      allowNull: false
    },
    mc_number: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    us_dot_number: {
      type: DataTypes.STRING,
      unique: true
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
    dock_height: DataTypes.STRING,
    dimensions: DataTypes.STRING,
    doors_type: DataTypes.STRING,
    door_clearance: DataTypes.STRING,
    accessories: DataTypes.STRING,
    max_weight: DataTypes.STRING,
    temp_control_range: DataTypes.STRING,
    agreed_percentage: DataTypes.STRING,
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'pending', 'suspended'),
      defaultValue: 'pending'
    },
    insurance_company_name: DataTypes.STRING,
    insurance_company_address: DataTypes.STRING,
    insurance_agent_name: DataTypes.STRING,
    insurance_agent_number: DataTypes.STRING,
    insurance_agent_email: DataTypes.STRING,
    factoring_company_name: DataTypes.STRING,
    factoring_company_address: DataTypes.STRING,
    factoring_agent_name: DataTypes.STRING,
    factoring_agent_number: DataTypes.STRING,
    factoring_agent_email: DataTypes.STRING,
    notes_home_town: DataTypes.STRING,
    notes_days_working: DataTypes.STRING,
    notes_preferred_lanes: DataTypes.TEXT,
    notes_additional_preferences: DataTypes.TEXT,
    notes_parking_space: DataTypes.STRING,
    notes_average_gross: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'carrier_profile',
    timestamps: true,
    underscored: true
  });

  return CarrierProfile;
};