'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('brokers', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      brokerage_company: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      agent_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      agent_phone: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      agent_email: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      updated_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    // Add indexes
    await queryInterface.addIndex('brokers', ['brokerage_company']);
    await queryInterface.addIndex('brokers', ['agent_email']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('brokers');
  }
};
