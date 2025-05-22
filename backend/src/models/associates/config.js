
exports.UserModel = (db) => {
  db.User.hasMany(db.CarrierProfile, { foreignKey: 'agent_name', as: 'managedCarriers' });
  db.User.hasMany(db.Dispatch, { foreignKey: 'user_id', as: 'dispatches' });
  db.User.hasMany(db.FollowupSheet, { foreignKey: 'agent_name', as: 'followups' });
  db.User.hasMany(db.Notification, { foreignKey: 'username', as: 'notifications' });
};

exports.CarrierProfileModel = (db) => {
  db.CarrierProfile.belongsTo(db.User, { foreignKey: 'agent_name', as: 'agent' });
  db.CarrierProfile.hasMany(db.Dispatch, { foreignKey: 'carrier_id', as: 'dispatches' });
  db.CarrierProfile.hasMany(db.FollowupSheet, { foreignKey: 'mc_no', as: 'followups' });
};

exports.DispatchModel = (db) => {
  db.Dispatch.belongsTo(db.User, { foreignKey: 'user_id', as: 'user' });
  db.Dispatch.belongsTo(db.CarrierProfile, { foreignKey: 'carrier_id', as: 'carrier' });
  db.Dispatch.hasOne(db.Invoice, { foreignKey: 'dispatch_id', as: 'invoice' });
};

exports.InvoiceModel = (db) => {
  db.Invoice.belongsTo(db.Dispatch, { foreignKey: 'dispatch_id', as: 'dispatch' });
};

exports.NotificationModel = (db) => {
  db.Notification.belongsTo(db.User, { foreignKey: 'username', as: 'user' });
};
