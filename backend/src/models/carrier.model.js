"use strict";
const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class CarrierProfile extends Model {
    static associate(models) {
      // Associations are now managed in associates/config.js
    }
  }

  CarrierProfile.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      agent_name: {
        type: DataTypes.STRING,
        //allowNull: false
      },
      mc_number: {
        type: DataTypes.STRING,
        // unique: true,
        //  allowNull: false
      },
      us_dot_number: {
        type: DataTypes.STRING,
        // unique: true,
      },      company_name: {
        type: DataTypes.STRING,
        //  allowNull: false
      },
      dba: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Doing Business As name'
      },
      owner_name: {
        type: DataTypes.STRING,
        // allowNull: false
      },
      phone_number: {
        type: DataTypes.STRING,
        //allowNull: false
      },
      email_address: {
        type: DataTypes.STRING,
        // allowNull: false,
        // validate: {
        //   isEmail: true,
        // },
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
        type: DataTypes.ENUM("active", "inactive", "pending", "suspended"),
        defaultValue: "pending",
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
      notes_average_gross: DataTypes.STRING,

      // Office use fields
      office_use_carrier_no: DataTypes.STRING,
      office_use_team_assigned: DataTypes.STRING,
      office_use_special_notes: DataTypes.TEXT,

      // Driver information fields
      driver_name: DataTypes.STRING,
      driver_phone: DataTypes.STRING,
      driver_email: DataTypes.STRING,
      driver_license_number: DataTypes.STRING,
      driver_license_state: DataTypes.STRING,
      driver_license_expiration: {
        type: DataTypes.DATE,
        allowNull: true
      },

      // Admin only fields - DAT Information
      dat_username: DataTypes.STRING,
      dat_password: DataTypes.STRING,

      // Admin only fields - Truckstop Information
      truckstop_username: DataTypes.STRING,
      truckstop_password: DataTypes.STRING,
      truckstop_carrier_id: DataTypes.STRING,
      truckstop_carrier_zip: DataTypes.STRING,

      // Admin only fields - ELD Information
      eld_provider: DataTypes.STRING,
      eld_site: DataTypes.STRING,
      eld_username: DataTypes.STRING,
      eld_password: DataTypes.STRING,      // Admin only fields - MyCarrierPackets Information
      mycarrierpackets_username: DataTypes.STRING,
      mycarrierpackets_password: DataTypes.STRING,

      // Admin only fields - Highway Information
      highway_number: DataTypes.STRING,
      highway_email: DataTypes.STRING,

      // Approval workflow fields
      approval_status: {
        type: DataTypes.ENUM('pending', 'manager_approved', 'approved', 'rejected', 'disabled'),
        defaultValue: 'pending',
        allowNull: false,
      },
      approved_by_manager: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
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
          key: 'id',
        },
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
          key: 'id',
        },
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
        allowNull: false,
      },
      disabled_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
      },      disabled_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },

      // Commission tracking fields
      commission_status: {
        type: DataTypes.ENUM('not_eligible', 'pending', 'confirmed_sale', 'paid'),
        defaultValue: 'not_eligible',
        allowNull: false,
        comment: 'Commission payment status for sales agents'
      },
      commission_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        comment: 'Commission amount to be paid to sales agent'
      },      commission_paid_at: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'When commission was paid to sales agent'
      },
      commission_paid: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
        comment: 'Whether commission has been paid to sales agent'
      },
      commission_paid_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
        comment: 'User who marked commission as paid'
      },
      loads_completed: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
        comment: 'Number of loads completed by this carrier'
      },
      first_load_completed_at: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'When the first load was completed (triggers confirmed sale)'
      },      sales_agent_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
        comment: 'Sales agent who brought this carrier (for commission tracking)'
      },
      created_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
        comment: 'User who created this carrier profile'
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
      modelName: "carrier_profile",
      timestamps: true,
      underscored: true,
    },
  );

  return CarrierProfile;
};
