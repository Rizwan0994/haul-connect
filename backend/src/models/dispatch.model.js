
'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Dispatch extends Model {
    static associate(models) {
      Dispatch.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
      Dispatch.belongsTo(models.CarrierProfile, { foreignKey: 'carrier_id', as: 'carrier' });
      Dispatch.hasMany(models.DispatchLoad, { foreignKey: 'dispatch_id', as: 'loads' });
    }
  }

  Dispatch.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    department: DataTypes.STRING,
    booking_date: DataTypes.DATE,
    load_no: {
      type: DataTypes.STRING,
      unique: true
    },
    pickup_date: DataTypes.DATE,
    dropoff_date: DataTypes.DATE,
    carrier_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    origin: DataTypes.STRING,
    destination: DataTypes.STRING,
    brokerage_company: DataTypes.STRING,
    brokerage_agent: DataTypes.STRING,
    agent_ph: DataTypes.STRING,
    agent_email: DataTypes.STRING,
    load_amount: DataTypes.DECIMAL(10, 2),
    charge_percent: DataTypes.DECIMAL(5, 2),
    status: {
      type: DataTypes.ENUM('pending', 'in_transit', 'delivered', 'completed'),
      defaultValue: 'pending'
    },
    payment: DataTypes.JSON,
    dispatcher: DataTypes.STRING,
    invoice_status: {
      type: DataTypes.ENUM('not_sent', 'sent', 'pending', 'cleared'),
      defaultValue: 'not_sent'
    },
    payment_method: {
      type: DataTypes.ENUM('ACH', 'ZELLE', 'OTHER'),
      defaultValue: 'ACH'
    }
  }, {
    sequelize,
    modelName: 'dispatch',
    timestamps: true,
    underscored: true
  });

  return Dispatch;
};
