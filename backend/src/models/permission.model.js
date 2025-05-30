"use strict";
const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class Permission extends Model {
    static associate(models) {
      Permission.belongsToMany(models.role, {
        through: models.role_permission,
        foreignKey: "permission_id",
        otherKey: "role_id"
      });
    }
  }

  Permission.init(
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
      // Type can be feature, route, or column
      type: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isIn: [['feature', 'route', 'column']]
        }
      },
      // Module this permission belongs to (e.g., user, carrier, dispatch)
      module: {
        type: DataTypes.STRING,
        allowNull: false
      },
      resource: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: "The specific resource this permission applies to (e.g., user_list, carrier_detail, etc.)"
      },
      action: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: "The action allowed (view, create, update, delete)"
      },
      description: {
        type: DataTypes.STRING,
        allowNull: true
      }
    },
    {
      sequelize,
      modelName: "permission",
      tableName: "permissions",
      underscored: true,
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return Permission;
};
