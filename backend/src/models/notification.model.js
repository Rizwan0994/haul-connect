"use strict";
const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {  class Notification extends Model {
    static associate(models) {
      // Define associations if needed
      // For example, notifications could be associated with users
      Notification.belongsTo(models.user, {
        foreignKey: "user_id",
        as: "user"
      });
      
      // Association with sender (admin who created the notification)
      Notification.belongsTo(models.user, {
        foreignKey: "sender_id",
        as: "sender"
      });
    }
  }

  Notification.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },      user_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      sender_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        comment: "ID of the admin user who created this notification"
      },
      email: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: "Title for custom notifications"
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false,
      },      type: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'info', // info, warning, error, success
      },
      is_custom: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: "Indicates if this is a custom notification created by admin"
      },
      read: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      link: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: "Optional link to navigate to when clicking the notification"
      }
    },
    {
      sequelize,
      modelName: "notification",
      tableName: "notifications",
      underscored: true,
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return Notification;
};
