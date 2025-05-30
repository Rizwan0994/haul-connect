"use strict";
const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class Role extends Model {
    static associate(models) {
      Role.hasMany(models.user, {
        foreignKey: "role_id"
      });
      
      Role.belongsToMany(models.permission, {
        through: models.role_permission,
        foreignKey: "role_id",
        otherKey: "permission_id"
      });
    }
  }

  Role.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      guard_name: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "web"
      },
      description: {
        type: DataTypes.STRING,
        allowNull: true
      },
      is_system_role: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: "Indicates if this is a system-defined role that cannot be deleted"
      }
    },
    {
      sequelize,
      modelName: "role",
      tableName: "roles",
      underscored: true,
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return Role;
};
