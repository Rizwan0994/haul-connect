'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('carrier_profiles', 'approval_status', {
      type: Sequelize.ENUM('pending', 'manager_approved', 'approved', 'rejected', 'disabled'),
      defaultValue: 'pending',
      allowNull: false,
    });

    // Manager approval fields
    await queryInterface.addColumn('carrier_profiles', 'approved_by_manager', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addColumn('carrier_profiles', 'manager_approved_at', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    // Accounts/admin approval fields
    await queryInterface.addColumn('carrier_profiles', 'approved_by_accounts', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addColumn('carrier_profiles', 'accounts_approved_at', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    // Rejection fields
    await queryInterface.addColumn('carrier_profiles', 'rejected_by', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addColumn('carrier_profiles', 'rejected_at', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn('carrier_profiles', 'rejection_reason', {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    // Disable fields
    await queryInterface.addColumn('carrier_profiles', 'is_disabled', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    });

    await queryInterface.addColumn('carrier_profiles', 'disabled_by', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addColumn('carrier_profiles', 'disabled_at', {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('carrier_profiles', 'approval_status');
    await queryInterface.removeColumn('carrier_profiles', 'approved_by_manager');
    await queryInterface.removeColumn('carrier_profiles', 'manager_approved_at');
    await queryInterface.removeColumn('carrier_profiles', 'approved_by_accounts');
    await queryInterface.removeColumn('carrier_profiles', 'accounts_approved_at');
    await queryInterface.removeColumn('carrier_profiles', 'rejected_by');
    await queryInterface.removeColumn('carrier_profiles', 'rejected_at');
    await queryInterface.removeColumn('carrier_profiles', 'rejection_reason');
    await queryInterface.removeColumn('carrier_profiles', 'is_disabled');
    await queryInterface.removeColumn('carrier_profiles', 'disabled_by');
    await queryInterface.removeColumn('carrier_profiles', 'disabled_at');
  }
};
