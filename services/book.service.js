const { utils, write, read, readFile } = require("xlsx");
const { writeFileSync, unlink } = require("fs");
const productService = require("./product.service");
const path = require("path");
const ApiError = require("../api/ApiError");

class BookService {
  async createBook(filter) {
    try {
      const workbook = utils.book_new();

      const products = await productService.getProducts(filter);

      const filteredProducts = products.filter((p) => p.checked);

      let array = [];

      if (filter.filterType === "provider") {
        for (let i = 0; i < filteredProducts.length; i++) {
          const elemIndex = array.findIndex((elem) => elem.productTitleProvider === filteredProducts[i].productTitleProvider);
          if (elemIndex >= 0) {
            array[elemIndex].delivery = +array[elemIndex].delivery + +filteredProducts[i].delivery;
          } else array.push(filteredProducts[i]);
        }
      } else array = filteredProducts;

      const productsData = array.map((p) => {
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
        arr.push(+data.delivery);
        return arr;
      });

      const finalData = [["артикул", "имя (необязательно)", "количество"], ...productsData];

      const worksheet = utils.aoa_to_sheet(finalData);

      const wscols = [{ wch: 25 }, { wch: 75 }, { wch: 10 }];

      worksheet["!cols"] = wscols;

      utils.book_append_sheet(workbook, worksheet, "К поставке");

      const buf = write(workbook, {
        type: "buffer",
        bookType: "xlsx",
      });
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
    const year = date.getFullYear();

    const createText = (number) => (number < 10 ? `0${number}` : `${number}`);

    const dayText = createText(day);
    const monthText = createText(month + 1);

    return `${dayText}${monthText}${year}`;
  }

  async readBook(file) {
    try {
      const filePath = path.join(__dirname, "..", "public", `input.xlsx`);

      await file.mv(filePath);

      const workbook = readFile(filePath);

      const sheet = workbook.Sheets[workbook.SheetNames[0]];

      const sheetJSON = utils.sheet_to_json(sheet);

      const array = sheetJSON.map((elem) => ({
        SKU: elem["Отчёт по остаткам и товарам в пути на склады Ozon"],
        warehouse: elem.__EMPTY,
        articleNumberOzon: elem.__EMPTY_1,
        productTitleOzon: elem.__EMPTY_2,
        productInTransit: elem.__EMPTY_3,
        availableToSale: elem.__EMPTY_4,
        reserve: elem.__EMPTY_5,
      }));

      const arrayForBd = array.slice(3);

      await productService.createProductsFromArray(arrayForBd);

      unlink(filePath, (err) => {
        if (err) console.log(err);
      });

      const products = await productService.getProducts();

      return products;
    } catch (error) {
      throw ApiError.BadRequest(error.message);
    }
  }
}

module.exports = new BookService();
