const formidable = require("formidable");
const bookService = require("../services/book.service");
const productService = require("../services/product.service");

class ProductController {
  createProduct(req, res) {
    try {
      const form = formidable({ multiples: true });

      form.parse(req, async (err, fields, files) => {
        if (err) {
          next(err);
          return;
        }
        const data = await productService.createProduct({ fields, files });
        return res.json(data);
      });
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async updateProduct(req, res) {
    try {
      const {
        params: { id },
        body,
        files: { img },
      } = req;
      await productService.updateProduct(id, body, img);
      const products = await productService.getProducts();
      return res.json(products);
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async updateChecked(req, res) {
    try {
      await productService.updateChecked(req.params.id, req.query.checked);
      const products = await productService.getProducts();
      return res.json(products);
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async updateDelivery(req, res) {
    try {
      await productService.updateDelivery(req.params.id, req.query.delivery);
      const products = await productService.getProducts();
      return res.json(products);
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async getAll(req, res) {
    try {
      const products = await productService.getProducts();
      return res.json(products);
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async uploadXlsx(req, res) {
    try {
      const { xlsx } = req.files;
      const products = await bookService.readBook(xlsx);
      return res.json(products);
    } catch (error) {
      throw new Error(error.message);
    }
  }
}

module.exports = new ProductController();
