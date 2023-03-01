const Product = require("../models/product.model");
const axios = require("axios");

class ProductService {
  async createProduct(obj) {
    try {
      const possibleProduct = await Product.findOne({ where: { articleNumberOzon: obj.articleNumberOzon } });

      if (possibleProduct) {
        return possibleProduct;
      }

      const product = await Product.create({ ...obj });

      return product;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async updateProduct(id, obj) {
    const product = await Product.findOne({ where: { id } });

    let checked = false;

    const fullCount = +product.productInTransit + +product.availableToSale;

    let fullDelivery = 0;
    const delivery = +obj.minimum - fullCount;

    if (delivery > 0) {
      const boxesCount = Math.floor(delivery / obj.numberInBox);

      fullDelivery = boxesCount * obj.numberInBox;

      if (fullDelivery < delivery) fullDelivery = (boxesCount + 1) * obj.numberInBox;
    }

    if (fullDelivery !== 0) checked = true;

    await product.update({ ...obj, fullCount, checked, delivery: fullDelivery });

    await product.save();

    return;
  }

  async updateChecked(id, checked) {
    const product = await Product.findOne({ where: { id } });

    await product.update({ checked });

    await product.save();

    return;
  }

  async updateDelivery(id, delivery) {
    const product = await Product.findOne({ where: { id } });

    await product.update({ delivery });

    await product.save();

    return;
  }

  async getProducts(filter = null) {
    let products = null;

    if (filter) products = await Product.findAll({ where: { [filter.filterType]: filter.filterValue }, order: ["id"] });
    else products = await Product.findAll({ order: ["id"] });

    return products;
  }
}

module.exports = new ProductService();
