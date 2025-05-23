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
    port: dbConfig.DB_PORT,
    operatorsAliases: 0,
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

// Correctly invoke associations via associate/index.js
const tableConfiguration = require("./associates");
tableConfiguration(db); // ✅ This sets up all associations

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
