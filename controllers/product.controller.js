const ApiError = require("../api/ApiError");
const bookService = require("../services/book.service");
const productService = require("../services/product.service");

class ProductController {
  async createProduct(req, res, next) {
    try {
      const body = req.body;
      const files = req.files;

      if (files) await productService.createProduct(body, files["create-img"]);
      else await productService.createProduct(body);

      const products = await productService.getProducts();

      return res.json(products);
    } catch (error) {
      return next(ApiError.BadRequest(`ProductController: createProduct: ${error.message}`));
    }
  }

  async updateProduct(req, res, next) {
    try {
      const files = req.files;
      const {
        params: { id },
        body,
      } = req;

      if (files) await productService.updateProduct(id, body, files["img"]);
      else await productService.updateProduct(id, body);

      const products = await productService.getProducts();
      return res.json(products);
    } catch (error) {
      return next(ApiError.BadRequest(`ProductController: updateProduct: ${error.message}`));
    }
  }

  async updateArticles(req, res, next) {
    try {
      const body = req.body;
      const files = req.files;

      if (files) await productService.updateArticles(body, files["img"]);
      else await productService.updateArticles(body);

      const products = await productService.getProducts();
      return res.json(products);
    } catch (error) {
      return next(ApiError.BadRequest(`ProductController: updateArticles: ${error.message}`));
    }
  }

  async updateChecked(req, res, next) {
    try {
      await productService.updateChecked(req.params.id, req.query.checked);
      const products = await productService.getProducts();
      return res.json(products);
    } catch (error) {
      return next(ApiError.BadRequest(`ProductController: updateChecked: ${error.message}`));
    }
  }

  async updateDelivery(req, res, next) {
    try {
      await productService.updateDelivery(req.params.id, req.body["update-delivery"]);
      const products = await productService.getProducts();
      return res.json(products);
    } catch (error) {
      return next(ApiError.BadRequest(`ProductController: updateDelivery: ${error.message}`));
    }
  }

  async uploadFromOzon(req, res, next) {
    try {
      await productService.createProductsFromOzon();
      const products = await productService.getProducts();
      return res.json(products);
    } catch (error) {
      return next(ApiError.BadRequest(`ProductController: uploadFromOzon: ${error.message}`));
    }
  }

  async getAll(req, res, next) {
    try {
      const products = await productService.getProducts();
      return res.json(products);
    } catch (error) {
      return next(ApiError.BadRequest(`ProductController: getAll: ${error.message}`));
    }
  }

  async uploadXlsx(req, res, next) {
    try {
      const { xlsx } = req.files;
      const products = await bookService.readBook(xlsx);
      return res.json(products);
    } catch (error) {
      return next(ApiError.BadRequest(`ProductController: uploadXlsx: ${error.message}`));
    }
  }

  async summWarehouses(req, res, next) {
    try {
      const body = req.body;
      const warehouses = await productService.mergeWarehouses(body);

      console.log(warehouses);
      const products = await productService.getProducts();
      return res.json(products);
    } catch (error) {
      return next(ApiError.BadRequest(`ProductController: summWarehouses: ${error.message}`));
    }
  }

  async getOldBD(req, res, next) {
    try {
      await productService.getOldBD();
      const products = await productService.getProducts();
      return res.json(products);
    } catch (error) {
      return next(ApiError.BadRequest(`ProductController: getOldBD: ${error.message}`));
    }
  }
}

module.exports = new ProductController();
