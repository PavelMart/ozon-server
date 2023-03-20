const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const Warehouse = sequelize.define("warehouse", {
  title: { type: DataTypes.STRING, unique: true },
  includes: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] },
});

module.exports = Warehouse;
