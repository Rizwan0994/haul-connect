
exports.userModel = (db) => {
  db.user.hasMany(db.carrier_profile, { foreignKey: 'agent_name', as: 'managedCarriers' });
  db.user.hasMany(db.dispatch, { foreignKey: 'user_id', as: 'dispatches' });
  // db.user.hasMany(db.FollowupSheet, { foreignKey: 'agent_name', as: 'followups' });
  // db.user.hasMany(db.Notification, { foreignKey: 'username', as: 'notifications' });
  
  // New association for role-based permissions
  db.user.belongsTo(db.role, { foreignKey: 'role_id', as: 'userRole' });
};

exports.carrierModel = (db) => {
  db.carrier_profile.belongsTo(db.user, { foreignKey: 'agent_name', as: 'agent' });
  db.carrier_profile.hasMany(db.dispatch, { foreignKey: 'carrier_id', as: 'dispatches' });
  // db.carrier_profile.hasMany(db.FollowupSheet, { foreignKey: 'mc_no', as: 'followups' });
};

exports.dispatchModel = (db) => {
  db.dispatch.belongsTo(db.user, { foreignKey: 'user_id', as: 'user' });
  db.dispatch.belongsTo(db.carrier_profile, { foreignKey: 'carrier_id', as: 'carrier' });
  db.dispatch.hasOne(db.invoice, { foreignKey: 'dispatch_id', as: 'invoice' });
};

exports.invoiceModel = (db) => {
  db.invoice.belongsTo(db.dispatch, { foreignKey: 'dispatch_id', as: 'dispatch' });
};

exports.roleModel = (db) => {
  db.role.hasMany(db.user, { foreignKey: 'role_id', as: 'users' });
  db.role.belongsToMany(db.permission, { through: db.role_permission, foreignKey: 'role_id', as: 'permissions' });
};

exports.permissionModel = (db) => {
  db.permission.belongsToMany(db.role, { through: db.role_permission, foreignKey: 'permission_id', as: 'roles' });
};

exports.rolePermissionModel = (db) => {
  // This is a join table, associations defined in the role and permission models
};

// exports.NotificationModel = (db) => {
//   db.Notification.belongsTo(db.User, { foreignKey: 'username', as: 'user' });
// };
