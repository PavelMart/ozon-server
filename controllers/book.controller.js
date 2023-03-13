const bookService = require("../services/book.service");
const ApiError = require("../api/ApiError");

class BookController {
  async createBook(req, res, next) {
    try {
      const { filterType, filterValue } = req.query;
      await bookService.createBook({ filterType, filterValue });
      return res.json("Отчет сформирован");
    } catch (error) {
      return next(ApiError.BadRequest(`BookController: createBook: ${error.message}`));
    }
  }

  deleteBook(req, res, next) {
    try {
      const { name } = req.query;
      bookService.deleteBook(name);
      return res.json("Отчет удален с сервера");
    } catch (error) {
      return next(ApiError.BadRequest(`BookController: deleteBook: ${error.message}`));
    }
  }
}

module.exports = new BookController();
