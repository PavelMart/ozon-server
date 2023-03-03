const bookService = require("../services/book.service");
const ApiError = require("../api/ApiError");

class BookController {
  async createBook(req, res, next) {
    try {
      const { filterType, filterValue } = req.query;
      await bookService.createBook({ filterType, filterValue });
      return res.json("Отчет сформирован");
    } catch (error) {
      return next(ApiError.BadRequest(error.message));
    }
  }
}

module.exports = new BookController();
