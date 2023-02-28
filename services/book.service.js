const { utils, writeFile, write } = require("xlsx");
const { writeFileSync } = require("fs");
const productService = require("./product.service");

class BookService {
  async createBook(filter) {
    const workbook = utils.book_new();

    console.log(filter);

    const products = await productService.getProducts(filter);

    console.log("products", products);

    const productsData = products.map((p) => {
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
}

module.exports = new BookService();
