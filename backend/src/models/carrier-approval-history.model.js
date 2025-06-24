module.exports = (sequelize, DataTypes) => {
  const CarrierApprovalHistory = sequelize.define('CarrierApprovalHistory', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    carrier_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'carrier_profiles',
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
    tableName: 'carrier_approval_history',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  CarrierApprovalHistory.associate = function(models) {
    // Association with carrier_profile
    CarrierApprovalHistory.belongsTo(models.carrier_profile, {
      foreignKey: 'carrier_id',
      as: 'carrier'
    });

    // Association with user (action performer)
    CarrierApprovalHistory.belongsTo(models.user, {
      foreignKey: 'action_by_user_id',
      as: 'action_by'
    });
  };

  return CarrierApprovalHistory;
};
