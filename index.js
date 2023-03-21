const dotenv = require("dotenv");
const express = require("express");
const cors = require("cors");
const sequelize = require("./db");
const router = require("./routes");
const path = require("path");
const fileUpload = require("express-fileupload");
const errorMiddleware = require("./middleware/errorMiddlware");
const { Product } = require("./models/product.model");
const { ApiKey } = require("./models/api.model");
const ApiError = require("./api/ApiError");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(express.static("public"));

app.use(fileUpload({}));

app.get("/", (req, res, next) => {
  try {
    res.sendFile(path.resolve(__dirname, "index.html"));
  } catch (error) {
    return next(ApiError.BadRequest(`getHtml: ${error.message}`));
  }
});

app.use("/api", router);

app.use(errorMiddleware);

const start = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    app.listen(PORT, () => console.log(`Server has been started on PORT: ${PORT}`));
  } catch (error) {
    console.log(error);
  }
};

start();
