
exports.userModel = (db) => {
  db.user.hasMany(db.carrier_profile, { foreignKey: 'agent_name', as: 'managedCarriers' });
  db.user.hasMany(db.dispatch, { foreignKey: 'user_id', as: 'dispatches' });
  // db.user.hasMany(db.FollowupSheet, { foreignKey: 'agent_name', as: 'followups' });
  // db.user.hasMany(db.Notification, { foreignKey: 'username', as: 'notifications' });
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

// exports.NotificationModel = (db) => {
//   db.Notification.belongsTo(db.User, { foreignKey: 'username', as: 'user' });
// };
