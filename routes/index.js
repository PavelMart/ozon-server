const { Router } = require("express");
const bookController = require("../controllers/book.controller");
const productController = require("../controllers/product.controller");

const router = new Router();

router.post("/create-product", productController.createProduct);
router.get("/", productController.getAll);

router.get("/create-book", bookController.createBook);

module.exports = router;
