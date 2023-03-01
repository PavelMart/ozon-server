const { utils, write, read, readFile } = require("xlsx");
const { writeFileSync } = require("fs");
const productService = require("./product.service");
const path = require("path");
const uuid = require("uuid");
const ApiError = require("../api/ApiError");

class BookService {
  async createBook(filter) {
    try {
      const workbook = utils.book_new();

      const products = await productService.getProducts(filter);

      const filteredProducts = products.filter((p) => p.checked);

      const productsData = filteredProducts.map((p) => {
        const arr = [];
        const data = p.dataValues;

        if (filter.filterType === "warehouse") {
          arr.push(data.articleNumberOzon);
          arr.push(data.productTitleOzon);
        }
        if (filter.filterType === "provider") {
          arr.push(data.articleNumberProvider);
          arr.push(data.productTitleProvider);
        }
        arr.push(data.delivery);
        return arr;
      });

      const finalData = [["Артикул", "Название товара", "Заказ"], ...productsData];

      const worksheet = utils.aoa_to_sheet(finalData);

      utils.book_append_sheet(workbook, worksheet, "К поставке");

      const buf = write(workbook, { type: "buffer", bookType: "xlsx" });
      // /* buf is a Buffer */
      writeFileSync(`public/${this.createDate()}-${filter.filterValue}.xlsx`, buf);

      return;
    } catch (error) {
      throw ApiError.BadRequest(error.message);
    }
  }

  createDate() {
    const date = new Date();
    const day = date.getDate();
    const month = date.getMonth();

    const createText = (number) => (number < 10 ? `0${number}` : `${number}`);

    const dayText = createText(day);
    const monthText = createText(month + 1);

    return `${dayText}-${monthText}`;
  }

  async readBook(file) {
    try {
      const filePath = path.join(__dirname, "..", "public", `input.xlsx`);

      await file.mv(filePath);

      const workbook = readFile(filePath);

      const sheet = workbook.Sheets[workbook.SheetNames[0]];

      const sheetJSON = utils.sheet_to_json(sheet);

      const arrayForBd = sheetJSON.map((elem) => ({
        SKU: elem.SKU,
        warehouse: elem["Название склада"],
        articleNumberOzon: elem["Артикул"],
        productTitleOzon: elem["Название товара"],
        productInTransit: elem["Товары в пути"],
        availableToSale: elem["Доступный к продаже товар"],
        reserve: elem["Резерв"],
      }));

      for (let index = 0; index < arrayForBd.length; index++) {
        await productService.createProduct(arrayForBd[index]);
      }

      const products = await productService.getProducts();

      return products;
    } catch (error) {
      throw ApiError.BadRequest(error.message);
    }
  }
}

module.exports = new BookService();
