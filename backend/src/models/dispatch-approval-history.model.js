module.exports = (sequelize, DataTypes) => {
  const DispatchApprovalHistory = sequelize.define('DispatchApprovalHistory', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    dispatch_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'dispatches',
        key: 'id'
      }
    },
    action: {
      type: DataTypes.ENUM('created', 'manager_approved', 'accounts_approved', 'rejected', 'disabled', 'enabled'),
      allowNull: false
    },
    action_by_user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    action_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    rejection_reason: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'dispatch_approval_history',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  DispatchApprovalHistory.associate = function(models) {
    // Association with dispatch
    DispatchApprovalHistory.belongsTo(models.dispatch, {
      foreignKey: 'dispatch_id',
      as: 'dispatch'
    });

    // Association with user (action performer)
    DispatchApprovalHistory.belongsTo(models.user, {
      foreignKey: 'action_by_user_id',
      as: 'action_by'
    });
  };

  return DispatchApprovalHistory;
};
