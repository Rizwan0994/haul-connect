exports.UserModel = (db) => {
  db.User.hasMany(db.CarrierProfile, { foreignKey: 'agent_name', as: 'managedCarriers' });
};

exports.CarrierProfileModel = (db) => {
  db.CarrierProfile.belongsTo(db.User, { foreignKey: 'agent_name', as: 'agent' });
};
