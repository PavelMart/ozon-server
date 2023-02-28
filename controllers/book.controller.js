const bookService = require("../services/book.service");
const path = require("path");

class BookController {
  async createBook(req, res) {
    const { filterType, filterValue } = req.query;
    await bookService.createBook({ filterType, filterValue });
    return res.json("Отчет сформирован");
  }
}

module.exports = new BookController();
