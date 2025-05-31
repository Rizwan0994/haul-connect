'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add new fields for admin notification system
    await queryInterface.addColumn('notifications', 'title', {
      type: Sequelize.STRING,
      allowNull: true,
      after: 'email'
    });

    await queryInterface.addColumn('notifications', 'sender_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      after: 'user_id'
    });

    await queryInterface.addColumn('notifications', 'is_custom', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      after: 'type'
    });

    // Add indexes for better performance
    await queryInterface.addIndex('notifications', ['sender_id']);
    await queryInterface.addIndex('notifications', ['is_custom']);
    await queryInterface.addIndex('notifications', ['created_at']);
  },

  down: async (queryInterface, Sequelize) => {
    // Remove indexes first
    await queryInterface.removeIndex('notifications', ['sender_id']);
    await queryInterface.removeIndex('notifications', ['is_custom']);
    await queryInterface.removeIndex('notifications', ['created_at']);

    // Remove columns
    await queryInterface.removeColumn('notifications', 'title');
    await queryInterface.removeColumn('notifications', 'sender_id');
    await queryInterface.removeColumn('notifications', 'is_custom');
  }
};
