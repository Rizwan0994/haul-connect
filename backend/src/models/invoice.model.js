
'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Invoice extends Model {
    static associate(models) {
      // Associations are now managed in associates/config.js
    }
  }

  Invoice.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    invoice_number: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    dispatch_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    carrier_name: DataTypes.STRING,
    date: DataTypes.DATE,
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('Paid', 'Unpaid', 'Draft'),
      defaultValue: 'Draft'
    }
  }, {
    sequelize,
    modelName: 'invoice',
    timestamps: true,
    underscored: true
  });

  return Invoice;
};
