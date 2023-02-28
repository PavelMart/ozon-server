const Product = require("../models/product.model");
const axios = require("axios");

class ProductService {
  async createProduct(data) {
    try {
      const { fields, files } = data;

      const instance = axios.create({
        baseURL: "https://api-seller.ozon.ru",
      });

      instance.defaults.headers.common["Client-Id"] = "576811";
      instance.defaults.headers.common["Api-Key"] = "0a3268fe-ff2f-4b38-a05d-3a161297e885";
      instance.defaults.headers.common["Content-Type"] = "application/json";

      const response = await instance.post("/v2/product/info/list", {
        offer_id: [fields.articleNumberOzon],
      });

      const productFromOzon = response.data.result.items[0];

      const fullCount = +productFromOzon.stocks.coming + +productFromOzon.stocks.present;

      let fullDelivery = 0;
      const delivery = +fields.minimum - fullCount;

      if (delivery > 0) {
        const boxesCount = Math.floor(delivery / fields.numberInBox);

        fullDelivery = boxesCount * fields.numberInBox;

        if (fullDelivery < delivery) fullDelivery = (boxesCount + 1) * fields.numberInBox;
      }

      const obj = {
        ...fields,
        SKU: productFromOzon.fbo_sku,
        productInTransit: productFromOzon.stocks.coming,
        availableToSale: productFromOzon.stocks.present,
        reserve: productFromOzon.stocks.reserved,
        fullCount,
        delivery: fullDelivery,
      };

      await Product.create({ ...obj });

      const responseData = await this.getProducts();
      return responseData;
    } catch (error) {
      console.log(error);
      throw new Error(error.message);
    }
  }

  async getProducts(filter = null) {
    let products = null;

    if (filter) products = await Product.findAll({ where: { [filter.filterType]: filter.filterValue } });
    else products = await Product.findAll();

    return products;
  }
}

module.exports = new ProductService();
