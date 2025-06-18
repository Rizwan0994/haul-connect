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
  
  // Commission tracking associations
  db.user.hasMany(db.carrier_profile, { foreignKey: 'sales_agent_id', as: 'salesCarriers' });
  db.user.hasMany(db.carrier_profile, { foreignKey: 'commission_paid_by', as: 'commissionPayments' });
  // Employee Attendance association
  db.user.hasMany(db.employee_attendance, { foreignKey: 'employee_id', as: 'attendanceRecords' });
  db.user.hasMany(db.employee_attendance, { foreignKey: 'marked_by', as: 'markedAttendance' });
  // Contact management associations
  db.user.hasMany(db.broker, { foreignKey: 'created_by', as: 'createdBrokers' });
  db.user.hasMany(db.broker, { foreignKey: 'updated_by', as: 'updatedBrokers' });
  db.user.hasMany(db.shipper, { foreignKey: 'created_by', as: 'createdShippers' });
  db.user.hasMany(db.shipper, { foreignKey: 'updated_by', as: 'updatedShippers' });
  db.user.hasMany(db.consignee, { foreignKey: 'created_by', as: 'createdConsignees' });
  db.user.hasMany(db.consignee, { foreignKey: 'updated_by', as: 'updatedConsignees' });
  
  // Carrier creation association
  db.user.hasMany(db.carrier_profile, { foreignKey: 'created_by', as: 'createdCarriers' });
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
  
  // Carrier approval workflow associations
  db.carrier_profile.belongsTo(db.user, { foreignKey: 'approved_by_manager', as: 'managerApprover' });
  db.carrier_profile.belongsTo(db.user, { foreignKey: 'approved_by_accounts', as: 'accountsApprover' });
  db.carrier_profile.belongsTo(db.user, { foreignKey: 'rejected_by', as: 'rejectedBy' });
  db.carrier_profile.belongsTo(db.user, { foreignKey: 'disabled_by', as: 'disabledBy' });
    // Commission tracking associations
  db.carrier_profile.belongsTo(db.user, { foreignKey: 'sales_agent_id', as: 'salesAgent' });
  db.carrier_profile.belongsTo(db.user, { foreignKey: 'commission_paid_by', as: 'commissionPaidBy' });
  
  // Creator association
  db.carrier_profile.belongsTo(db.user, { foreignKey: 'created_by', as: 'creator' });
};

exports.dispatchModel = (db) => {
  db.dispatch.belongsTo(db.user, { foreignKey: 'user_id', as: 'user' });
  db.dispatch.belongsTo(db.carrier_profile, { foreignKey: 'carrier_id', as: 'carrier' });
  db.dispatch.hasOne(db.invoice, { foreignKey: 'dispatch_id', as: 'invoice' });
  
  // Approval workflow associations
  db.dispatch.belongsTo(db.user, { foreignKey: 'approved_by_manager', as: 'managerApprover' });
  db.dispatch.belongsTo(db.user, { foreignKey: 'approved_by_accounts', as: 'accountsApprover' });
  db.dispatch.belongsTo(db.user, { foreignKey: 'rejected_by', as: 'rejectedBy' });
  db.dispatch.belongsTo(db.user, { foreignKey: 'disabled_by', as: 'disabledBy' });
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

// Employee Attendance associations
exports['employee-attendanceModel'] = (db) => {
  db.employee_attendance.belongsTo(db.user, { foreignKey: 'employee_id', as: 'employee' });
  db.employee_attendance.belongsTo(db.user, { foreignKey: 'marked_by', as: 'markedBy' });
};

// Broker associations
exports.brokerModel = (db) => {
  db.broker.belongsTo(db.user, { foreignKey: 'created_by', as: 'createdBy' });
  db.broker.belongsTo(db.user, { foreignKey: 'updated_by', as: 'updatedBy' });
};

// Shipper associations
exports.shipperModel = (db) => {
  db.shipper.belongsTo(db.user, { foreignKey: 'created_by', as: 'createdBy' });
  db.shipper.belongsTo(db.user, { foreignKey: 'updated_by', as: 'updatedBy' });
};

// Consignee associations
exports.consigneeModel = (db) => {
  db.consignee.belongsTo(db.user, { foreignKey: 'created_by', as: 'createdBy' });
  db.consignee.belongsTo(db.user, { foreignKey: 'updated_by', as: 'updatedBy' });
};
