const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const ApiKey = sequelize.define("apikey", {
  key: { type: DataTypes.TEXT, defaultValue: "" },
});

module.exports = ApiKey;
