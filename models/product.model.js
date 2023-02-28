const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const Product = sequelize.define("product", {
  SKU: { type: DataTypes.TEXT, defaultValue: 0 },
  articleNumberProvider: { type: DataTypes.TEXT },
  articleNumberOzon: { type: DataTypes.TEXT },
  productTitleProvider: { type: DataTypes.TEXT },
  productTitleOzon: { type: DataTypes.TEXT },
  provider: { type: DataTypes.TEXT },
  warehouse: { type: DataTypes.TEXT },
  productInTransit: { type: DataTypes.TEXT, defaultValue: 0 },
  availableToSale: { type: DataTypes.TEXT, defaultValue: 0 },
  reserve: { type: DataTypes.TEXT, defaultValue: 0 },
  numberInBox: { type: DataTypes.TEXT, defaultValue: 0 },
  volume: { type: DataTypes.TEXT, defaultValue: 0 },
  minimum: { type: DataTypes.TEXT, defaultValue: 0 },
  fullCount: { type: DataTypes.TEXT, defaultValue: 0 },
  delivery: { type: DataTypes.TEXT, defaultValue: 0 },
});

module.exports = Product;
