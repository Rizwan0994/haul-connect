
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
    total_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    carrier_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    profit_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    carrier_percentage: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false
    },
    invoice_date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    due_date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('draft', 'sent', 'paid', 'overdue', 'cancelled'),
      defaultValue: 'draft'
    },
    email_sent_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    email_sent_to: {
      type: DataTypes.STRING,
      allowNull: true
    },
    payment_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'invoice',
    timestamps: true,
    underscored: true
  });

  return Invoice;
};
