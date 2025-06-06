"use strict";
const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class SMTPSettings extends Model {
    static associate(models) {
      // No associations needed for this model
    }
  }

  SMTPSettings.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: "Descriptive name for this SMTP configuration"
      },
      host: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: "SMTP server hostname"
      },
      port: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 587,
        comment: "SMTP server port"
      },
      secure: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: "Whether to use SSL/TLS"
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: "SMTP authentication username"
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: "SMTP authentication password (encrypted)"
      },
      from_email: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: "Default FROM email address"
      },
      from_name: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'Haul Connect Logistics',
        comment: "Default FROM name"
      },
      is_default: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: "Whether this is the default SMTP configuration"
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        comment: "Whether this SMTP configuration is active"
      },
      test_email: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: "Last email address used for testing"
      },
      last_tested_at: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: "When this configuration was last tested"
      },
      test_status: {
        type: DataTypes.ENUM('success', 'failed', 'pending'),
        allowNull: true,
        comment: "Status of the last test"
      },
      test_error: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: "Error message from last failed test"
      },
      created_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      updated_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      }
    },
    {
      sequelize,
      modelName: "smtp_settings",
      tableName: "smtp_settings",
      timestamps: true,
      underscored: true,
      indexes: [
        {
          unique: true,
          fields: ['name']
        }
      ],
      hooks: {
        beforeCreate: async (smtpSettings) => {
          // If this is set as default, unset all other defaults
          if (smtpSettings.is_default) {
            await SMTPSettings.update(
              { is_default: false },
              { where: { is_default: true } }
            );
          }
        },
        beforeUpdate: async (smtpSettings) => {
          // If this is set as default, unset all other defaults
          if (smtpSettings.is_default && smtpSettings.changed('is_default')) {
            await SMTPSettings.update(
              { is_default: false },
              { where: { is_default: true, id: { [sequelize.Sequelize.Op.ne]: smtpSettings.id } } }
            );
          }
        }
      }
    }
  );

  return SMTPSettings;
};
