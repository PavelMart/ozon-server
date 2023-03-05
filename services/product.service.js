const Product = require("../models/product.model");
const path = require("path");
const uuid = require("uuid");
const { default: axios } = require("axios");
const ApiError = require("../api/ApiError");
const apiService = require("./api.service");
const { unlink } = require("fs");

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

  calculateProductDataV2(product, obj) {
    let checked = false;

    const fullCount = +obj.productInTransit + +obj.availableToSale;

    let fullDelivery = 0;

    const delivery = +obj.minimum - fullCount;

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

      if (product.img !== "") {
        const oldImgPath = path.join(__dirname, "..", "public", `${product.img}`);

        unlink(oldImgPath, (err) => {
          if (err) console.log(err);
        });
      }

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

  async updateArticles(data, img) {
    try {
      const products = await Product.findAll({ where: { articleNumberOzon: data["article-for-update"] } });

      for (let i = 0; i < products.length; i++) {
        if (products[i].img !== "") {
          const oldImgPath = path.join(__dirname, "..", "public", `${products[i].img}`);

          unlink(oldImgPath, (err) => {
            if (err) console.log(err);
          });
        }

        let fullName = "";

        if (img) {
          const ext = img.name.split(".").pop();
          fullName = `${uuid.v4()}.${ext}`;

          const filePath = path.join(__dirname, "..", "public", fullName);

          await img.mv(filePath);
        }

        const calculatedData = this.calculateProductDataV2(data, products[i]);

        if (img) await products[i].update({ ...data, ...calculatedData, img: fullName });
        else await products[i].update({ ...data, ...calculatedData });

        await products[i].save();
      }

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

      if (filter)
        products = await Product.findAll({
          where: { [filter.filterType]: filter.filterValue },
          order: [
            ["articleNumberOzon", "ASC"],
            ["warehouse", "ASC"],
          ],
        });
      else
        products = await Product.findAll({
          order: [
            ["articleNumberOzon", "ASC"],
            ["warehouse", "ASC"],
          ],
        });

      return products;
    } catch (error) {
      throw ApiError.BadRequest(error.message);
    }
  }

  async summWarehouses(data) {
    try {
      const mainWarehouseArray = await Product.findAll({
        where: { warehouse: data["main-warehouse"] },
      });

      let entryDataArray = [];
      let secondDataArray = [];

      console.log(data);

      if (typeof data["second-warehouses"] === "object") entryDataArray = [...data["second-warehouses"]];
      else entryDataArray.push(data["second-warehouses"]);

      for (let i = 0; i < entryDataArray.length; i++) {
        const currentWarehouses = await Product.findAll({ where: { warehouse: entryDataArray[i] } });

        secondDataArray.push(...currentWarehouses);
      }

      for (let i = 0; i < mainWarehouseArray.length; i++) {
        for (let j = 0; j < secondDataArray.length; j++) {
          if (mainWarehouseArray[i].articleNumberOzon === secondDataArray[j].articleNumberOzon) {
            await mainWarehouseArray[i].update({
              productInTransit: +secondDataArray[j].productInTransit + +mainWarehouseArray[i].productInTransit,
              availableToSale: +secondDataArray[j].availableToSale + +mainWarehouseArray[i].availableToSale,
              reserve: +secondDataArray[j].reserve + +mainWarehouseArray[i].reserve,
              fullCount: +secondDataArray[j].fullCount + +mainWarehouseArray[i].fullCount,
              delivery: +secondDataArray[j].delivery + +mainWarehouseArray[i].delivery,
            });
            await Product.destroy({ where: { id: secondDataArray[j].id } });
          } else {
            await secondDataArray[j].update({ warehouse: mainWarehouseArray[i].warehouse });
            await secondDataArray[j].save();
          }
        }
        const calculatedData = this.calculateProductDataV2(mainWarehouseArray[i], mainWarehouseArray[i]);
        await mainWarehouseArray[i].update({ ...calculatedData });
        await mainWarehouseArray[i].save();
      }
      return;
    } catch (error) {
      throw ApiError.BadRequest(error.message);
    }
  }
}

module.exports = new ProductService();
