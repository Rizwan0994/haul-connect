exports.userModel = (db) => {
  db.user.hasMany(db.carrier_profile, { foreignKey: 'agent_name', as: 'managedCarriers' });
  db.user.hasMany(db.dispatch, { foreignKey: 'user_id', as: 'dispatches' });
  db.user.hasMany(db.notification, { foreignKey: 'user_id', as: 'notifications' });
  // db.user.hasMany(db.FollowupSheet, { foreignKey: 'agent_name', as: 'followups' });
  
  // New association for role-based permissions
  db.user.belongsTo(db.role, { foreignKey: 'role_id', as: 'userRole' });
  
  // Carrier user assignments
  db.user.hasMany(db.carrier_user_assignment, { foreignKey: 'user_id', as: 'carrierAssignments' });
  db.user.hasMany(db.carrier_user_assignment, { foreignKey: 'assigned_by', as: 'assignmentsCreated' });
  db.user.belongsToMany(db.carrier_profile, { 
    through: db.carrier_user_assignment, 
    foreignKey: 'user_id',
    otherKey: 'carrier_id',
    as: 'assignedCarriers' 
  });
};

exports.carrierModel = (db) => {
  db.carrier_profile.belongsTo(db.user, { foreignKey: 'agent_name', as: 'agent' });
  db.carrier_profile.hasMany(db.dispatch, { foreignKey: 'carrier_id', as: 'dispatches' });
  // db.carrier_profile.hasMany(db.FollowupSheet, { foreignKey: 'mc_no', as: 'followups' });
  
  // Carrier user assignments
  db.carrier_profile.hasMany(db.carrier_user_assignment, { foreignKey: 'carrier_id', as: 'userAssignments' });
  db.carrier_profile.belongsToMany(db.user, { 
    through: db.carrier_user_assignment, 
    foreignKey: 'carrier_id',
    otherKey: 'user_id',
    as: 'assignedUsers' 
  });
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

exports.notificationModel = (db) => {
  db.notification.belongsTo(db.user, { foreignKey: 'user_id', as: 'user' });
  db.notification.belongsTo(db.user, { foreignKey: 'sender_id', as: 'sender' });
};

exports['carrier-user-assignmentModel'] = (db) => {
  db.carrier_user_assignment.belongsTo(db.carrier_profile, { foreignKey: 'carrier_id', as: 'carrier' });
  db.carrier_user_assignment.belongsTo(db.user, { foreignKey: 'user_id', as: 'user' });
  db.carrier_user_assignment.belongsTo(db.user, { foreignKey: 'assigned_by', as: 'assignedBy' });
};
