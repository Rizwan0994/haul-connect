"use strict";
const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class RolePermission extends Model {
    static associate(models) {
      // No direct associations needed as this is a join table
    }
  }

  RolePermission.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      role_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'roles',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      permission_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'permissions',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      }
    },
    {
      sequelize,
      modelName: "role_permission",
      tableName: "role_permissions",
      underscored: true,
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [
        {
          unique: true,
          fields: ['role_id', 'permission_id']
        }
      ]
    }
  );

  return RolePermission;
};
