const Product = require("../models/product.model");
const path = require("path");
const uuid = require("uuid");
const ApiError = require("../api/ApiError");

class ProductService {
  async createProduct(body, img = null) {
    try {
      const possibleProduct = await Product.findOne({ where: { articleNumberOzon: body.articleNumberOzon } });

      if (possibleProduct) {
        throw new Error("Такой товар уже существует");
      }

      let fullName = "";

      if (img) {
        const ext = img.name.split(".").pop();
        fullName = `${uuid.v4()}.${ext}`;

        const filePath = path.join(__dirname, "..", "public", fullName);

        await img.mv(filePath);
      }

      await Product.create({ ...body, img: fullName });

      return;
    } catch (error) {
      throw ApiError.BadRequest(error.message);
    }
  }

  async createProductsFromArray(array) {
    for (let index = 0; index < array.length; index++) {
      const possibleProduct = await Product.findOne({
        where: { articleNumberOzon: array[index].articleNumberOzon, warehouse: array[index].warehouse },
      });

      if (!possibleProduct) {
        await Product.create({ ...array[index] });
      } else {
        const calculatedData = this.calculateProductData(possibleProduct, array[index]);

        await possibleProduct.update({ ...array[index], ...calculatedData });

        await possibleProduct.save();
      }
    }
    return;
  }

  calculateProductData(product, obj) {
    let checked = false;

    const fullCount = +obj.productInTransit + +obj.availableToSale;

    let fullDelivery = 0;
    const delivery = +product.minimum - fullCount;

    if (delivery > 0) {
      const boxesCount = Math.floor(delivery / product.numberInBox);

      fullDelivery = boxesCount * product.numberInBox;

      if (fullDelivery < delivery) fullDelivery = (boxesCount + 1) * product.numberInBox;
    }

    if (fullDelivery !== 0) checked = true;

    return {
      checked,
      fullCount,
      delivery: fullDelivery,
    };
  }

  calculateProductDataV2(obj, product) {
    let checked = false;

    const fullCount = +obj.productInTransit + +obj.availableToSale;

    let fullDelivery = 0;
    const delivery = +product.minimum - fullCount;

    if (delivery > 0) {
      const boxesCount = Math.floor(delivery / product.numberInBox);

      fullDelivery = boxesCount * product.numberInBox;

      if (fullDelivery < delivery) fullDelivery = (boxesCount + 1) * product.numberInBox;
    }

    if (fullDelivery !== 0) checked = true;

    return {
      checked,
      fullCount,
      delivery: fullDelivery,
    };
  }

  async updateProduct(id, obj, img) {
    try {
      const product = await Product.findOne({ where: { id } });

      let fullName = "";

      if (img) {
        const ext = img.name.split(".").pop();
        fullName = `${uuid.v4()}.${ext}`;

        const filePath = path.join(__dirname, "..", "public", fullName);

        await img.mv(filePath);
      }

      const calculatedData = this.calculateProductDataV2(product, obj);

      await product.update({ ...obj, ...calculatedData, img: fullName });

      await product.save();

      return;
    } catch (error) {
      throw ApiError.BadRequest(error.message);
    }
  }

  async updateChecked(id, checked) {
    try {
      const product = await Product.findOne({ where: { id } });

      await product.update({ checked });

      await product.save();

      return;
    } catch (error) {
      throw ApiError.BadRequest(error.message);
    }
  }

  async updateDelivery(id, delivery) {
    try {
      const product = await Product.findOne({ where: { id } });

      await product.update({ delivery });

      await product.save();

      return;
    } catch (error) {
      throw ApiError.BadRequest(error.message);
    }
  }

  async getProducts(filter = null) {
    try {
      let products = null;

      if (filter) products = await Product.findAll({ where: { [filter.filterType]: filter.filterValue }, order: ["id"] });
      else products = await Product.findAll({ order: ["id"] });

      return products;
    } catch (error) {
      throw ApiError.BadRequest(error.message);
    }
  }
}

module.exports = new ProductService();
