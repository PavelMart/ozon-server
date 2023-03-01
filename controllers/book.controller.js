const bookService = require("../services/book.service");
const path = require("path");

class BookController {
  async createBook(req, res) {
    try {
      const { filterType, filterValue } = req.query;
      await bookService.createBook({ filterType, filterValue });
      return res.json("Отчет сформирован");
    } catch (error) {
      throw new Error(error.message);
    }
  }
}

module.exports = new BookController();
