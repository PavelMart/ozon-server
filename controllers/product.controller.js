const formidable = require("formidable");
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

  async getAll(req, res) {
    const products = await productService.getProducts();

    return res.json(products);
  }
}

module.exports = new ProductController();
