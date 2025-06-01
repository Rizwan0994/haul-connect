'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class UserDocument extends Model {
    static associate(models) {
      UserDocument.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      });
    }
  }

  UserDocument.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users', // Make sure your users table name is correct here
        key: 'id'
      }
    },
    document_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    document_url: {
      type: DataTypes.STRING,
      allowNull: false
    },
    uploaded_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'user_document',
    tableName: 'user_documents',
    timestamps: true,
    underscored: true
  });

  return UserDocument;
};
