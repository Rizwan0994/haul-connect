'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create carrier approval history table
    await queryInterface.createTable('carrier_approval_history', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      carrier_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'carrier_profiles',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      action: {
        type: Sequelize.ENUM('created', 'manager_approved', 'accounts_approved', 'rejected', 'disabled', 'enabled'),
        allowNull: false
      },
      action_by_user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      action_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      rejection_reason: {
        type: Sequelize.TEXT,
        allowNull: true
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

    // Create dispatch approval history table
    await queryInterface.createTable('dispatch_approval_history', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      dispatch_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'dispatches',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      action: {
        type: Sequelize.ENUM('created', 'manager_approved', 'accounts_approved', 'rejected', 'disabled', 'enabled'),
        allowNull: false
      },
      action_by_user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      action_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      rejection_reason: {
        type: Sequelize.TEXT,
        allowNull: true
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

    // Add indexes for better performance
    await queryInterface.addIndex('carrier_approval_history', ['carrier_id']);
    await queryInterface.addIndex('carrier_approval_history', ['action_by_user_id']);
    await queryInterface.addIndex('carrier_approval_history', ['action_at']);
    
    await queryInterface.addIndex('dispatch_approval_history', ['dispatch_id']);
    await queryInterface.addIndex('dispatch_approval_history', ['action_by_user_id']);
    await queryInterface.addIndex('dispatch_approval_history', ['action_at']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('dispatch_approval_history');
    await queryInterface.dropTable('carrier_approval_history');
  }
};
