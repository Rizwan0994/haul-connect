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
    dialectOptions: process.env["NODE_ENV"] === "development" ? {} : {},
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

// Import all models
fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf(".") !== 0 &&
      file !== basename &&
      file.slice(-3) === ".js" &&
      !file.includes("associates") &&
      file !== "index.js"
    );
  })
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(
      sequelize,
      Sequelize.DataTypes,
    );
    db[model.name] = model;
  });

// Set up associations after all models are loaded
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});
console.log("Loaded models:", Object.keys(db));

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
