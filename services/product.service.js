const Product = require("../models/product.model");
const path = require("path");
const uuid = require("uuid");

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

  async updateProduct(id, obj, img) {
    try {
      const product = await Product.findOne({ where: { id } });

      const ext = img.name.split(".").pop();
      const fullName = `${uuid.v4()}.${ext}`;

      const filePath = path.join(__dirname, "..", "public", fullName);

      img.mv(filePath);

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

      await product.update({ ...obj, fullCount, checked, delivery: fullDelivery, img: fullName });

      await product.save();

      return;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async updateChecked(id, checked) {
    try {
      const product = await Product.findOne({ where: { id } });

      await product.update({ checked });

      await product.save();

      return;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async updateDelivery(id, delivery) {
    try {
      const product = await Product.findOne({ where: { id } });

      await product.update({ delivery });

      await product.save();

      return;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async getProducts(filter = null) {
    try {
      let products = null;

      if (filter) products = await Product.findAll({ where: { [filter.filterType]: filter.filterValue }, order: ["id"] });
      else products = await Product.findAll({ order: ["id"] });

      return products;
    } catch (error) {
      throw new Error(error.message);
    }
  }
}

module.exports = new ProductService();
