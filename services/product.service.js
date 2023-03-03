const Product = require("../models/product.model");
const path = require("path");
const uuid = require("uuid");
const { default: axios } = require("axios");
const ApiError = require("../api/ApiError");
const apiService = require("./api.service");

class ProductService {
  async createProduct(body, img = null) {
    try {
      const possibleProduct = await Product.findOne({ where: { articleNumberOzon: body.articleNumberOzon } });

      if (possibleProduct) {
        throw new Error("Такой товар уже существует");
      }

      const delivery = +body.minimum;

      let fullName = "";

      if (img) {
        const ext = img.name.split(".").pop();
        fullName = `${uuid.v4()}.${ext}`;

        const filePath = path.join(__dirname, "..", "public", fullName);

        await img.mv(filePath);
      }

      await Product.create({ ...body, img: fullName, delivery, checked: true });

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
        const calculatedData = this.calculateProductData(possibleProduct, array[index]);
        await Product.create({ ...array[index], ...calculatedData });
      } else {
        const calculatedData = this.calculateProductData(possibleProduct, array[index]);

        await possibleProduct.update({ ...array[index], ...calculatedData });

        await possibleProduct.save();
      }
    }
    return;
  }

  async createProductsFromOzon() {
    const { key } = await apiService.getApiKey();
    console.log(key);
    const instance = axios.create({
      headers: {
        "Client-Id": "576811",
        "Api-Key": key,
        "Content-Type": "application/json",
      },
    });
    const response = await instance.post("https://api-seller.ozon.ru/v2/analytics/stock_on_warehouses", {
      limit: 1000,
      offset: 0,
      warehouse_type: "ALL",
    });

    const productsFromOzon = response.data.result.rows;

    const array = productsFromOzon.map((elem) => ({
      SKU: elem.sku,
      warehouse: elem.warehouse_name,
      articleNumberOzon: elem.item_code,
      productTitleOzon: elem.item_name,
      productInTransit: elem.promised_amount,
      availableToSale: elem.free_to_sell_amount,
      reserve: elem.reserved_amount,
    }));

    await this.createProductsFromArray(array);

    return;
  }

  calculateProductData(product, obj) {
    let checked = false;

    const fullCount = +obj.productInTransit + +obj.availableToSale;

    let fullDelivery = 0;

    if (product) {
      const delivery = +product.minimum - fullCount;

      if (delivery > 0) {
        const boxesCount = Math.floor(delivery / product.numberInBox);

        fullDelivery = boxesCount * product.numberInBox;

        if (fullDelivery < delivery) fullDelivery = (boxesCount + 1) * product.numberInBox;
      }
    }

    if (fullDelivery !== 0) checked = true;

    return {
      checked,
      fullCount,
      delivery: fullDelivery,
    };
  }

  // calculateProductDataV2(obj, product) {
  //   let checked = false;

  //   const fullCount = +obj.productInTransit + +obj.availableToSale;

  //   let fullDelivery = 0;
  //   const delivery = +product.minimum - fullCount;

  //   if (delivery > 0) {
  //     const boxesCount = Math.floor(delivery / product.numberInBox);

  //     fullDelivery = boxesCount * product.numberInBox;

  //     if (fullDelivery < delivery) fullDelivery = (boxesCount + 1) * product.numberInBox;
  //   }

  //   if (fullDelivery !== 0) checked = true;

  //   return {
  //     checked,
  //     fullCount,
  //     delivery: fullDelivery,
  //   };
  // }

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

      const calculatedData = this.calculateProductData(obj, product);

      if (img) await product.update({ ...obj, ...calculatedData, img: fullName });
      else await product.update({ ...obj, ...calculatedData });

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
