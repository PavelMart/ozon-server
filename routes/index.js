const { Router } = require("express");
const apiController = require("../controllers/api.controller");
const bookController = require("../controllers/book.controller");
const productController = require("../controllers/product.controller");

const router = new Router();

router.post("/create-product", productController.createProduct);
router.post("/update-product/:id", productController.updateProduct);
router.post("/upload-xlsx", productController.uploadXlsx);
router.get("/", productController.getAll);
router.get("/upload-from-ozon", productController.uploadFromOzon);
router.get("/update-checked/:id", productController.updateChecked);
router.get("/update-delivery/:id", productController.updateDelivery);
router.get("/update-api-key", apiController.updateApiKey);
router.get("/create-book", bookController.createBook);

module.exports = router;
