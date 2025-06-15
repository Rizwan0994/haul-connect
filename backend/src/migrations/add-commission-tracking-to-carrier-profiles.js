'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('carrier_profiles', 'commission_status', {
      type: Sequelize.ENUM('not_eligible', 'pending', 'confirmed_sale', 'paid'),
      defaultValue: 'not_eligible',
      allowNull: false,
      comment: 'Commission payment status for sales agents'
    });

    await queryInterface.addColumn('carrier_profiles', 'commission_amount', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
      comment: 'Commission amount to be paid to sales agent'
    });

    await queryInterface.addColumn('carrier_profiles', 'commission_paid_at', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'When commission was paid to sales agent'
    });

    await queryInterface.addColumn('carrier_profiles', 'commission_paid_by', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      comment: 'User who marked commission as paid'
    });

    await queryInterface.addColumn('carrier_profiles', 'loads_completed', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      allowNull: false,
      comment: 'Number of loads completed by this carrier'
    });

    await queryInterface.addColumn('carrier_profiles', 'first_load_completed_at', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'When the first load was completed (triggers confirmed sale)'
    });

    await queryInterface.addColumn('carrier_profiles', 'sales_agent_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      comment: 'Sales agent who brought this carrier (for commission tracking)'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('carrier_profiles', 'commission_status');
    await queryInterface.removeColumn('carrier_profiles', 'commission_amount');
    await queryInterface.removeColumn('carrier_profiles', 'commission_paid_at');
    await queryInterface.removeColumn('carrier_profiles', 'commission_paid_by');
    await queryInterface.removeColumn('carrier_profiles', 'loads_completed');
    await queryInterface.removeColumn('carrier_profiles', 'first_load_completed_at');
    await queryInterface.removeColumn('carrier_profiles', 'sales_agent_id');
  }
};
