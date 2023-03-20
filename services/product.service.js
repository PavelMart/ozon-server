const Product = require("../models/product.model");
const path = require("path");
const uuid = require("uuid");
const { default: axios } = require("axios");
const ApiError = require("../api/ApiError");
const apiService = require("./api.service");
const { unlink } = require("fs");
const Warehouse = require("../models/warehouse.model");

class ProductService {
  async createProduct(body, img = null) {
    try {
      const possibleProduct = await Product.findOne({ where: { articleNumberOzon: body.articleNumberOzon, warehouse: body.warehouse } });

      if (possibleProduct) {
        throw new Error("Такой товар уже существует");
      }

      const delivery = +body.minimum;

      const boxesCount = Math.floor(delivery / body.numberInBox);

      const fullDelivery = boxesCount * body.numberInBox;

      if (fullDelivery < delivery) fullDelivery = (boxesCount + 1) * body.numberInBox;

      let fullName = "";

      if (img) {
        const ext = img.name.split(".").pop();
        fullName = `${uuid.v4()}.${ext}`;

        const filePath = path.join(__dirname, "..", "public", fullName);

        await img.mv(filePath);
      }

      await Product.create({ ...body, img: fullName, delivery: fullDelivery, checked: true });

      return;
    } catch (error) {
      throw ApiError.BadRequest(`ProductService: createProduct: ${error.message}`);
    }
  }

  async createProductsFromArray(array) {
    try {
      const products = await Product.findAll();

      const indexes = [];

      for (let index = 0; index < array.length; index++) {
        products.forEach((product, i) => {
          if (product.articleNumberOzon === array[index].articleNumberOzon && product.warehouse === array[index].warehouse)
            indexes.push(product.id);
        });

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

      const unchangedProducts = [...products].filter((p) => !indexes.includes(p.id));

      for (let i = 0; i < unchangedProducts.length; i++) {
        const product = unchangedProducts[i];
        const zeroData = {
          productInTransit: "0",
          availableToSale: "0",
          reserve: "0",
        };
        const calculatedData = this.calculateProductData(product, zeroData);
        await product.update({
          ...zeroData,
          ...calculatedData,
        });
        await product.save();
      }
      return;
    } catch (error) {
      throw ApiError.BadRequest(`ProductService: createProductsFromArray: ${error.message}`);
    }
  }

  async getOldBD() {
    try {
      const response = await axios.get("http://141.8.193.46/api");
      const array = response.data;
      await this.createProductsFromArray(array);
      return;
    } catch (error) {
      throw ApiError.BadRequest(`ProductService: getOldBD: ${error.message}`);
    }
  }

  async createProductsFromOzon() {
    try {
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
    } catch (error) {
      throw ApiError.BadRequest(`ProductService: createProductsFromOzon: ${error.message}`);
    }
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

      let fullName = "";

      if (img) {
        if (product.img !== "") {
          const oldImgPath = path.join(__dirname, "..", "public", `${product.img}`);

          unlink(oldImgPath, (err) => {
            if (err) console.log(err);
          });
        }

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
      throw ApiError.BadRequest(`ProductService: updateProduct: ${error.message}`);
    }
  }

  async updateArticles(data, img) {
    try {
      const products = await Product.findAll({ where: { articleNumberOzon: data["article-for-update"] } });

      for (let i = 0; i < products.length; i++) {
        let fullName = "";

        if (img) {
          if (products[i].img !== "") {
            const oldImgPath = path.join(__dirname, "..", "public", `${products[i].img}`);

            unlink(oldImgPath, (err) => {
              if (err) console.log(err);
            });
          }

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
      throw ApiError.BadRequest(`ProductService: updateArticles: ${error.message}`);
    }
  }

  async updateChecked(id, checked) {
    try {
      const product = await Product.findOne({ where: { id } });

      await product.update({ checked });

      await product.save();

      return;
    } catch (error) {
      throw ApiError.BadRequest(`ProductService: updateChecked: ${error.message}`);
    }
  }

  async updateDelivery(id, delivery) {
    try {
      const product = await Product.findOne({ where: { id } });

      await product.update({ delivery });

      await product.save();

      return;
    } catch (error) {
      throw ApiError.BadRequest(`ProductService: updateDelivery: ${error.message}`);
    }
  }

  async getProducts(filter = null) {
    try {
      let products = null;

      if (filter)
        products = await Product.findAll({
          where: { [filter.filterType]: filter.filterValue },
          order: [
            ["productTitleProvider", "ASC"],
            ["warehouse", "ASC"],
            ["articleNumberOzon", "ASC"],
          ],
        });
      else
        products = await Product.findAll({
          order: [
            ["productTitleProvider", "ASC"],
            ["warehouse", "ASC"],
            ["articleNumberOzon", "ASC"],
          ],
        });

      return products;
    } catch (error) {
      throw ApiError.BadRequest(`ProductService: getProducts: ${error.message}`);
    }
  }

  async mergeWarehouses(data) {
    try {
      let warehouse = await Warehouse.findOne({
        where: { title: data["main-warehouse"] },
      });

      if (!warehouse) {
        warehouse = await Warehouse.create({ title: data["main-warehouse"] });
      }

      const includes = [];

      if (typeof data["second-warehouses"] === "object") includes.push(...data["second-warehouses"]);
      else includes.push(data["second-warehouses"]);

      await warehouse.update({ includes: [...warehouse.includes, ...includes] });
      await warehouse.save();

      await this.summWarehouses(warehouse);

      return await Warehouse.findAll();
    } catch (error) {
      throw ApiError.BadRequest(`ProductService: mergeWarehouses: ${error.message}`);
    }
  }

  async summWarehouses({ title, includes }) {
    try {
      const mainWarehouseProducts = await Product.findAll({
        where: { warehouse: title },
      });

      const includedWarehousesProducts = [];

      for (let i = 0; i < includes.length; i++) {
        const products = await Product.findAll({ where: { warehouse: includes[i] } });

        includedWarehousesProducts.push(...products);
      }

      for (let i = 0; i < mainWarehouseProducts.length; i++) {
        const product = includedWarehousesProducts.find(
          (product) => product.articleNumberOzon === mainWarehouseProducts[i].articleNumberOzon
        );
      }

      // for (let i = 0; i < mainWarehouseProducts.length; i++) {
      //   for (let j = 0; j < includedWarehousesProducts.length; j++) {
      //     if (mainWarehouseArray[i].articleNumberOzon === secondDataArray[j].articleNumberOzon) {
      //       await mainWarehouseArray[i].update({
      //         productInTransit: +secondDataArray[j].productInTransit + +mainWarehouseArray[i].productInTransit,
      //         availableToSale: +secondDataArray[j].availableToSale + +mainWarehouseArray[i].availableToSale,
      //         reserve: +secondDataArray[j].reserve + +mainWarehouseArray[i].reserve,
      //         fullCount: +secondDataArray[j].fullCount + +mainWarehouseArray[i].fullCount,
      //         delivery: +secondDataArray[j].delivery + +mainWarehouseArray[i].delivery,
      //       });
      //       await secondDataArray[j].update({ disabled: true });
      //       await secondDataArray[j].save();
      //     } else {
      //       const calculatedData = this.calculateProductDataV2(secondDataArray[j], secondDataArray[j]);
      //       await Product.create({ ...secondDataArray[j], ...calculatedData });
      //     }
      //   }
      //   const calculatedData = this.calculateProductDataV2(mainWarehouseArray[i], mainWarehouseArray[i]);
      //   await mainWarehouseArray[i].update({ ...calculatedData });
      //   await mainWarehouseArray[i].save();
      // }

      return;
    } catch (error) {
      throw ApiError.BadRequest(`ProductService: summWarehouses: ${error.message}`);
    }
  }
}

module.exports = new ProductService();
