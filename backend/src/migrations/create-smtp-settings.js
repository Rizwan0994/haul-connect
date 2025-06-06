'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('smtp_settings', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: "Descriptive name for this SMTP configuration"
      },
      host: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: "SMTP server hostname"
      },
      port: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 587,
        comment: "SMTP server port"
      },
      secure: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        comment: "Whether to use SSL/TLS"
      },
      username: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: "SMTP authentication username"
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: "SMTP authentication password (encrypted)"
      },
      from_email: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: "Default FROM email address"
      },
      from_name: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'Haul Connect Logistics',
        comment: "Default FROM name"
      },
      is_default: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        comment: "Whether this is the default SMTP configuration"
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        comment: "Whether this SMTP configuration is active"
      },
      test_email: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: "Last email address used for testing"
      },
      last_tested_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: "When this configuration was last tested"
      },
      test_status: {
        type: Sequelize.ENUM('success', 'failed', 'pending'),
        allowNull: true,
        comment: "Status of the last test"
      },
      test_error: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: "Error message from last failed test"
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      updated_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Add unique index on name
    await queryInterface.addIndex('smtp_settings', ['name'], {
      unique: true,
      name: 'smtp_settings_name_unique'
    });

    // Add index on is_default for faster queries
    await queryInterface.addIndex('smtp_settings', ['is_default'], {
      name: 'smtp_settings_is_default_idx'
    });

    // Add index on is_active for faster queries
    await queryInterface.addIndex('smtp_settings', ['is_active'], {
      name: 'smtp_settings_is_active_idx'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('smtp_settings');
  }
};
