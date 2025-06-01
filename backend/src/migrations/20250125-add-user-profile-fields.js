'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add legacy fields for backward compatibility
    await queryInterface.addColumn('users', 'username', {
      type: Sequelize.STRING,
      allowNull: true,
      after: 'email'
    });

    await queryInterface.addColumn('users', 'role', {
      type: Sequelize.STRING,
      allowNull: true,
      after: 'role_id'
    });

    await queryInterface.addColumn('users', 'category', {
      type: Sequelize.STRING,
      allowNull: true,
      after: 'role'
    });

    // Add new profile fields
    await queryInterface.addColumn('users', 'father_name', {
      type: Sequelize.STRING,
      allowNull: true,
      after: 'last_name'
    });

    await queryInterface.addColumn('users', 'address', {
      type: Sequelize.TEXT,
      allowNull: true,
      after: 'father_name'
    });

    await queryInterface.addColumn('users', 'contact', {
      type: Sequelize.STRING,
      allowNull: true,
      after: 'phone'
    });

    await queryInterface.addColumn('users', 'cnic', {
      type: Sequelize.STRING,
      allowNull: true,
      after: 'contact'
    });

    await queryInterface.addColumn('users', 'experience', {
      type: Sequelize.STRING,
      allowNull: true,
      after: 'cnic'
    });

    await queryInterface.addColumn('users', 'department', {
      type: Sequelize.STRING,
      allowNull: true,
      after: 'experience'
    });

    await queryInterface.addColumn('users', 'photo_url', {
      type: Sequelize.STRING,
      allowNull: true,
      after: 'department'
    });

    await queryInterface.addColumn('users', 'last_login', {
      type: Sequelize.DATE,
      allowNull: true,
      after: 'photo_url'
    });

    await queryInterface.addColumn('users', 'last_login_ip', {
      type: Sequelize.STRING,
      allowNull: true,
      after: 'last_login'
    });

    // Add indexes for better performance
    await queryInterface.addIndex('users', ['username']);
    await queryInterface.addIndex('users', ['cnic']);
    await queryInterface.addIndex('users', ['department']);
  },

  down: async (queryInterface, Sequelize) => {
    // Remove indexes first
    await queryInterface.removeIndex('users', ['username']);
    await queryInterface.removeIndex('users', ['cnic']);
    await queryInterface.removeIndex('users', ['department']);

    // Remove columns
    await queryInterface.removeColumn('users', 'last_login_ip');
    await queryInterface.removeColumn('users', 'last_login');
    await queryInterface.removeColumn('users', 'photo_url');
    await queryInterface.removeColumn('users', 'department');
    await queryInterface.removeColumn('users', 'experience');
    await queryInterface.removeColumn('users', 'cnic');
    await queryInterface.removeColumn('users', 'contact');
    await queryInterface.removeColumn('users', 'address');
    await queryInterface.removeColumn('users', 'father_name');
    await queryInterface.removeColumn('users', 'category');
    await queryInterface.removeColumn('users', 'role');
    await queryInterface.removeColumn('users', 'username');
  }
};
