"use strict";
const dbConfig = require("../config/db");

const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const basename = path.basename(__filename);
const sequelize = new Sequelize(
  dbConfig.DB_NAME,
  dbConfig.DB_USER,
  dbConfig.DB_PASSWORD,
  {
    host: dbConfig.DB_HOST,
    dialect: dbConfig.dialect,
    operatorsAliases: 0,
    port: dbConfig.DB_PORT,
    dialectOptions:
      process.env["NODE_ENV"] === "development"
        ? {}
        : {
            // ssl: {
            //   require: true,
            //   rejectUnauthorized: false,
            // },
          },
    // replication: dbConfig.replication,
    pool: {
      max: dbConfig.pool.max,
      min: dbConfig.pool.min,
      acquire: dbConfig.pool.acquire,
      idle: dbConfig.pool.idle,
    },
    logging: false,
  },
);

const db = {};
sequelize
  .authenticate()
  .then(() => {
    // console.log('Connection has been established successfully.');
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err);
  });
fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf(".") !== 0 &&
      file !== basename &&
      file.slice(-3) === ".js" &&
      file !== "associate.js" &&
      file !== "associates" &&
      file !== "config.js"
    );
  })
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(
      sequelize,
      Sequelize.DataTypes,
    );
    db[model.name] = model;
  });
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.Sequelize = Sequelize;
db.sequelize = sequelize;
db.Op = Sequelize.Op;
//db.user=require('./user.model')(sequelize);
// db.role = require('./role.model')(sequelize);
// db.invoice = require('./invoice.model')(sequelize);
// db.carrier = require('./carrier.model')(sequelize);
// db.dispatch = require('./dispatch.model')(sequelize);

require("./associates")(db);

module.exports = db;
