"use strict";
const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class Dispatch extends Model {
    static associate(models) {
      // Associations are now managed in associates/config.js
    }
  }

  Dispatch.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      department: DataTypes.STRING,
      booking_date: DataTypes.DATE,
      load_no: {
        type: DataTypes.STRING,
        unique: true,
      },
      pickup_date: DataTypes.DATE,
      dropoff_date: DataTypes.DATE,
      carrier_id: {
        type: DataTypes.INTEGER,
        defaultValue: 6,
        allowNull: false,
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
        type: DataTypes.ENUM(
          "Scheduled",
          "In Transit",
          "Delivered",
          "Cancelled",
        ),
        defaultValue: "Scheduled",
      },
      payment: DataTypes.STRING,
      dispatcher: DataTypes.STRING,
      invoice_status: {
        type: DataTypes.ENUM(
          "Not Sent",
          "Invoice Sent",
          "Invoice Pending",
          "Invoice Cleared",
        ),
        defaultValue: "Not Sent",
      },
      payment_method: {
        type: DataTypes.ENUM("ACH", "ZELLE", "OTHER"),
        defaultValue: "ACH",
      },
      // Approval workflow fields
      approval_status: {
        type: DataTypes.ENUM(
          "pending",
          "manager_approved", 
          "accounts_approved",
          "rejected",
          "disabled"
        ),
        defaultValue: "pending",
      },
      approved_by_manager: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      manager_approved_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      approved_by_accounts: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      accounts_approved_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      rejected_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      rejected_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      rejection_reason: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      is_disabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      disabled_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      disabled_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "dispatch",
      timestamps: true,
      underscored: true,
    },
  );

  return Dispatch;
};
